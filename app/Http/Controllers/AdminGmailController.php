<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AdminGmailController extends Controller
{
    private const TOKEN_CACHE_KEY = 'integrations:gmail:token';
    private const STATE_CACHE_PREFIX = 'integrations:gmail:oauth_state:';
    private const MESSAGE_METADATA_HEADERS = ['From', 'To', 'Subject', 'Date', 'Message-ID', 'Reply-To', 'References', 'In-Reply-To'];

    public function authUrl(Request $request)
    {
        $clientId = config('services.google.client_id');
        $redirectUri = config('services.google.redirect_uri');

        if (!is_string($clientId) || $clientId === '' || !is_string($redirectUri) || $redirectUri === '') {
            return response()->json([
                'message' => 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI.',
            ], 500);
        }

        $state = Str::random(48);
        Cache::put(self::STATE_CACHE_PREFIX.$state, true, now()->addMinutes(10));

        $scopes = [
            'https://www.googleapis.com/auth/gmail.modify',
        ];

        $query = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => implode(' ', $scopes),
            'access_type' => 'offline',
            'prompt' => 'consent',
            'include_granted_scopes' => 'true',
            'state' => $state,
        ]);

        return response()->json([
            'url' => 'https://accounts.google.com/o/oauth2/v2/auth?'.$query,
        ]);
    }

    public function oauthCallback(Request $request)
    {
        $state = $request->string('state')->toString();
        $code = $request->string('code')->toString();
        $error = $request->string('error')->toString();

        if ($error !== '') {
            return response('Authorization cancelled.', 400);
        }

        if ($state === '' || $code === '') {
            return response('Missing OAuth parameters.', 400);
        }

        $stateKey = self::STATE_CACHE_PREFIX.$state;
        if (!Cache::pull($stateKey)) {
            return response('Invalid or expired OAuth state. Please try again.', 400);
        }

        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect_uri');

        if (
            !is_string($clientId) || $clientId === '' ||
            !is_string($clientSecret) || $clientSecret === '' ||
            !is_string($redirectUri) || $redirectUri === ''
        ) {
            return response('Google OAuth is not configured.', 500);
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
            'code' => $code,
        ]);

        if (!$response->successful()) {
            return response('Failed to exchange authorization code.', 500);
        }

        $token = $response->json();
        if (!is_array($token) || !isset($token['access_token'])) {
            return response('Invalid token response from Google.', 500);
        }

        $existing = $this->getToken();
        if ((!isset($token['refresh_token']) || !is_string($token['refresh_token']) || $token['refresh_token'] === '') && $existing && isset($existing['refresh_token'])) {
            $token['refresh_token'] = $existing['refresh_token'];
        }

        $token['created_at'] = now()->timestamp;

        Cache::put(self::TOKEN_CACHE_KEY, Crypt::encryptString(json_encode($token)), now()->addDays(365));

        return response('Gmail connected. You can close this tab.');
    }

    public function status()
    {
        return response()->json([
            'connected' => $this->getToken() !== null,
        ]);
    }

    public function inbox(Request $request)
    {
        $max = (int) $request->query('max', 10);
        $max = max(1, min(20, $max));

        $accessToken = $this->getValidAccessToken();
        if ($accessToken === null) {
            return response()->json([
                'message' => 'Gmail is not connected. Connect Google OAuth first.',
            ], 400);
        }

        $list = Http::withToken($accessToken)->get('https://gmail.googleapis.com/gmail/v1/users/me/messages', [
            'maxResults' => $max,
            'q' => 'in:inbox',
        ]);

        if (!$list->successful()) {
            return response()->json([
                'message' => 'Failed to fetch Gmail inbox.',
            ], 500);
        }

        $messageRefs = $list->json('messages') ?? [];
        if (!is_array($messageRefs)) {
            $messageRefs = [];
        }

        $messages = [];
        foreach ($messageRefs as $ref) {
            if (!is_array($ref) || !isset($ref['id']) || !is_string($ref['id'])) {
                continue;
            }

            $meta = Http::withToken($accessToken)->get('https://gmail.googleapis.com/gmail/v1/users/me/messages/'.$ref['id'], [
                'format' => 'metadata',
                'metadataHeaders' => self::MESSAGE_METADATA_HEADERS,
            ]);

            if (!$meta->successful()) {
                continue;
            }

            $data = $meta->json();
            if (!is_array($data)) {
                continue;
            }

            $headers = $this->headersToMap($data['payload']['headers'] ?? []);
            $labelIds = $data['labelIds'] ?? [];
            $unread = is_array($labelIds) && in_array('UNREAD', $labelIds, true);

            $messages[] = [
                'id' => $data['id'] ?? null,
                'thread_id' => $data['threadId'] ?? null,
                'snippet' => $data['snippet'] ?? null,
                'from' => $headers['from'] ?? null,
                'to' => $headers['to'] ?? null,
                'subject' => $headers['subject'] ?? null,
                'date' => $headers['date'] ?? null,
                'message_id' => $headers['message-id'] ?? null,
                'unread' => $unread,
            ];
        }

        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function spam(Request $request)
    {
        $max = (int) $request->query('max', 10);
        $max = max(1, min(20, $max));

        $accessToken = $this->getValidAccessToken();
        if ($accessToken === null) {
            return response()->json([
                'message' => 'Gmail is not connected. Connect Google OAuth first.',
            ], 400);
        }

        $list = Http::withToken($accessToken)->get('https://gmail.googleapis.com/gmail/v1/users/me/messages', [
            'maxResults' => $max,
            'q' => 'in:spam',
        ]);

        if (!$list->successful()) {
            return response()->json([
                'message' => 'Failed to fetch Gmail spam.',
            ], 500);
        }

        $messageRefs = $list->json('messages') ?? [];
        if (!is_array($messageRefs)) {
            $messageRefs = [];
        }

        $messages = [];
        $idsToMove = [];
        foreach ($messageRefs as $ref) {
            if (!is_array($ref) || !isset($ref['id']) || !is_string($ref['id'])) {
                continue;
            }

            $meta = Http::withToken($accessToken)->get('https://gmail.googleapis.com/gmail/v1/users/me/messages/'.$ref['id'], [
                'format' => 'metadata',
                'metadataHeaders' => self::MESSAGE_METADATA_HEADERS,
            ]);

            if (!$meta->successful()) {
                continue;
            }

            $data = $meta->json();
            if (!is_array($data)) {
                continue;
            }

            $headers = $this->headersToMap($data['payload']['headers'] ?? []);
            $labelIds = $data['labelIds'] ?? [];
            $unread = is_array($labelIds) && in_array('UNREAD', $labelIds, true);

            $fromHeader = $headers['from'] ?? null;
            $fromEmail = is_string($fromHeader) ? $this->extractEmailAddress($fromHeader) : null;
            if (is_string($fromEmail) && $fromEmail !== '' && $this->isClientEmail($fromEmail)) {
                $id = $data['id'] ?? null;
                if (is_string($id) && $id !== '') {
                    $idsToMove[] = $id;
                }
            }

            $messages[] = [
                'id' => $data['id'] ?? null,
                'thread_id' => $data['threadId'] ?? null,
                'snippet' => $data['snippet'] ?? null,
                'from' => $headers['from'] ?? null,
                'to' => $headers['to'] ?? null,
                'subject' => $headers['subject'] ?? null,
                'date' => $headers['date'] ?? null,
                'message_id' => $headers['message-id'] ?? null,
                'unread' => $unread,
            ];
        }

        return response()->json([
            'messages' => $messages,
            'moved_to_inbox' => $this->moveMessagesFromSpamToInbox($accessToken, $idsToMove),
        ]);
    }

    public function attachment(Request $request, string $id, string $attachmentId)
    {
        if ($id === '' || $attachmentId === '') {
            return response()->json([
                'message' => 'Missing attachment parameters.',
            ], 400);
        }

        $accessToken = $this->getValidAccessToken();
        if ($accessToken === null) {
            return response()->json([
                'message' => 'Gmail is not connected. Connect Google OAuth first.',
            ], 400);
        }

        $attach = Http::withToken($accessToken)->get('https://gmail.googleapis.com/gmail/v1/users/me/messages/'.$id.'/attachments/'.$attachmentId);
        if (!$attach->successful()) {
            return response()->json([
                'message' => 'Failed to fetch attachment.',
            ], 500);
        }

        $payload = $attach->json();
        if (!is_array($payload) || !isset($payload['data']) || !is_string($payload['data'])) {
            return response()->json([
                'message' => 'Invalid attachment payload.',
            ], 500);
        }

        $data = $this->base64UrlDecode($payload['data']);

        $meta = $this->findAttachmentMeta($accessToken, $id, $attachmentId);
        $filename = isset($meta['filename']) && is_string($meta['filename']) && $meta['filename'] !== '' ? $meta['filename'] : 'attachment';
        $mime = isset($meta['mime_type']) && is_string($meta['mime_type']) && $meta['mime_type'] !== '' ? $meta['mime_type'] : 'application/octet-stream';

        $safe = preg_replace('/[^\w.\-() ]+/', '_', $filename) ?? 'attachment';
        $disposition = $request->string('disposition')->toString() === 'attachment' ? 'attachment' : 'inline';

        return response($data, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => $disposition.'; filename="'.$safe.'"',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    public function message(string $id)
    {
        if ($id === '') {
            return response()->json([
                'message' => 'Missing message id.',
            ], 400);
        }

        $accessToken = $this->getValidAccessToken();
        if ($accessToken === null) {
            return response()->json([
                'message' => 'Gmail is not connected. Connect Google OAuth first.',
            ], 400);
        }

        $res = Http::withToken($accessToken)->get('https://gmail.googleapis.com/gmail/v1/users/me/messages/'.$id, [
            'format' => 'full',
        ]);

        if (!$res->successful()) {
            return response()->json([
                'message' => 'Failed to load message.',
            ], 500);
        }

        $data = $res->json();
        if (!is_array($data)) {
            return response()->json([
                'message' => 'Invalid message payload.',
            ], 500);
        }

        $headers = $this->headersToMap($data['payload']['headers'] ?? []);
        $bodies = $this->extractBodies($data['payload'] ?? []);
        $attachments = $this->extractAttachments($data['payload'] ?? []);
        $labelIds = $data['labelIds'] ?? [];
        $unread = is_array($labelIds) && in_array('UNREAD', $labelIds, true);

        return response()->json([
            'id' => $data['id'] ?? null,
            'thread_id' => $data['threadId'] ?? null,
            'snippet' => $data['snippet'] ?? null,
            'from' => $headers['from'] ?? null,
            'to' => $headers['to'] ?? null,
            'cc' => $headers['cc'] ?? null,
            'reply_to' => $headers['reply-to'] ?? null,
            'subject' => $headers['subject'] ?? null,
            'date' => $headers['date'] ?? null,
            'message_id' => $headers['message-id'] ?? null,
            'references' => $headers['references'] ?? null,
            'in_reply_to' => $headers['in-reply-to'] ?? null,
            'text' => $bodies['text'] ?? null,
            'html' => $bodies['html'] ?? null,
            'attachments' => $attachments,
            'unread' => $unread,
        ]);
    }

    public function thread(string $id)
    {
        if ($id === '') {
            return response()->json([
                'message' => 'Missing thread id.',
            ], 400);
        }

        $accessToken = $this->getValidAccessToken();
        if ($accessToken === null) {
            return response()->json([
                'message' => 'Gmail is not connected. Connect Google OAuth first.',
            ], 400);
        }

        $res = Http::withToken($accessToken)->get('https://gmail.googleapis.com/gmail/v1/users/me/threads/'.$id, [
            'format' => 'full',
        ]);

        if (!$res->successful()) {
            return response()->json([
                'message' => 'Failed to load thread.',
            ], 500);
        }

        $data = $res->json();
        if (!is_array($data)) {
            return response()->json([
                'message' => 'Invalid thread payload.',
            ], 500);
        }

        $messages = [];
        $threadMessages = $data['messages'] ?? null;
        if (is_array($threadMessages)) {
            foreach ($threadMessages as $msg) {
                if (!is_array($msg)) {
                    continue;
                }

                $headers = $this->headersToMap($msg['payload']['headers'] ?? []);
                $bodies = $this->extractBodies($msg['payload'] ?? []);
                $attachments = $this->extractAttachments($msg['payload'] ?? []);
                $labelIds = $msg['labelIds'] ?? [];
                $unread = is_array($labelIds) && in_array('UNREAD', $labelIds, true);

                $messages[] = [
                    'id' => $msg['id'] ?? null,
                    'thread_id' => $msg['threadId'] ?? null,
                    'snippet' => $msg['snippet'] ?? null,
                    'from' => $headers['from'] ?? null,
                    'to' => $headers['to'] ?? null,
                    'cc' => $headers['cc'] ?? null,
                    'reply_to' => $headers['reply-to'] ?? null,
                    'subject' => $headers['subject'] ?? null,
                    'date' => $headers['date'] ?? null,
                    'message_id' => $headers['message-id'] ?? null,
                    'references' => $headers['references'] ?? null,
                    'in_reply_to' => $headers['in-reply-to'] ?? null,
                    'text' => $bodies['text'] ?? null,
                    'html' => $bodies['html'] ?? null,
                    'attachments' => $attachments,
                    'unread' => $unread,
                ];
            }
        }

        $fromAddress = config('mail.from_addresses.support') ?: config('mail.from.address');
        $fromName = config('mail.from.name');
        $fromLabel = is_string($fromName) && $fromName !== '' ? $fromName : 'Sarafina';

        try {
            $sent = DB::table('admin_sent_emails')
                ->where('thread_id', $id)
                ->orderBy('created_at')
                ->get(['id', 'to', 'subject', 'body', 'cc', 'bcc', 'created_at']);
        } catch (\Throwable) {
            $sent = collect();
        }

        foreach ($sent as $s) {
            $cc = isset($s->cc) && is_string($s->cc) ? $s->cc : null;
            $html = view('emails.admin.manual', ['bodyHtml' => $this->formatEmailBody(is_string($s->body) ? $s->body : '')])->render();

            $messages[] = [
                'id' => 'sent:'.(string) $s->id,
                'thread_id' => $id,
                'snippet' => null,
                'from' => $fromLabel.' <'.$fromAddress.'>',
                'to' => $s->to ?? null,
                'cc' => $cc,
                'reply_to' => null,
                'subject' => $s->subject ?? null,
                'date' => isset($s->created_at) ? (string) $s->created_at : null,
                'message_id' => null,
                'references' => null,
                'in_reply_to' => null,
                'text' => $s->body ?? null,
                'html' => $html,
            ];
        }

        usort($messages, function ($a, $b) {
            $ad = is_array($a) && isset($a['date']) && is_string($a['date']) ? strtotime($a['date']) : 0;
            $bd = is_array($b) && isset($b['date']) && is_string($b['date']) ? strtotime($b['date']) : 0;
            return ($ad <=> $bd);
        });

        return response()->json([
            'thread_id' => $data['id'] ?? null,
            'messages' => $messages,
        ]);
    }

    public function reply(Request $request)
    {
        $validated = $request->validate([
            'gmail_message_id' => 'required|string',
            'body' => 'required|string',
            'subject' => 'nullable|string',
            'to' => 'nullable|string',
            'cc' => 'nullable|string',
            'bcc' => 'nullable|string',
            'attachments' => 'sometimes|array',
            'attachments.*' => 'file|max:10240',
        ]);

        $accessToken = $this->getValidAccessToken();
        if ($accessToken === null) {
            return response()->json([
                'message' => 'Gmail is not connected. Connect Google OAuth first.',
            ], 400);
        }

        $meta = Http::withToken($accessToken)->get('https://gmail.googleapis.com/gmail/v1/users/me/messages/'.$validated['gmail_message_id'], [
            'format' => 'metadata',
            'metadataHeaders' => ['From', 'To', 'Cc', 'Subject', 'Date', 'Message-ID', 'Reply-To', 'References', 'In-Reply-To'],
        ]);

        if (!$meta->successful()) {
            return response()->json([
                'message' => 'Failed to load message metadata.',
            ], 500);
        }

        $data = $meta->json();
        if (!is_array($data)) {
            return response()->json([
                'message' => 'Invalid message metadata.',
            ], 500);
        }

        $headers = $this->headersToMap($data['payload']['headers'] ?? []);
        $replyToRaw = $headers['reply-to'] ?? null;
        $fromRaw = $headers['from'] ?? null;

        $to = $validated['to'] ?? $this->extractEmailAddress(is_string($replyToRaw) && $replyToRaw !== '' ? $replyToRaw : (is_string($fromRaw) ? $fromRaw : ''));
        if (!is_string($to) || $to === '') {
            return response()->json([
                'message' => 'Could not determine recipient address for reply.',
            ], 400);
        }

        $originalSubject = is_string($headers['subject'] ?? null) ? $headers['subject'] : '';
        $subject = $validated['subject'] ?? $this->ensureReplySubject($originalSubject);

        $originalMessageId = is_string($headers['message-id'] ?? null) ? $headers['message-id'] : null;
        $references = is_string($headers['references'] ?? null) ? $headers['references'] : null;

        $inReplyTo = $originalMessageId;
        $referencesValue = $this->buildReferences($references, $originalMessageId);

        $fromAddress = config('mail.from_addresses.support') ?: config('mail.from.address');
        $fromName = config('mail.from.name');

        $bodyHtml = $this->formatEmailBody($validated['body']);
        $cc = $this->parseAddressList($validated['cc'] ?? null);
        $bcc = $this->parseAddressList($validated['bcc'] ?? null);
        $attachments = $request->file('attachments', []);

        Mail::send('emails.admin.manual', ['bodyHtml' => $bodyHtml], function ($message) use ($to, $subject, $fromAddress, $fromName, $inReplyTo, $referencesValue, $cc, $bcc, $attachments) {
            $message->to($to);
            if (!empty($cc)) {
                $message->cc($cc);
            }
            if (!empty($bcc)) {
                $message->bcc($bcc);
            }
            $message->subject($subject);

            if (is_string($fromAddress) && $fromAddress !== '') {
                $message->from($fromAddress, is_string($fromName) ? $fromName : null);
            }

            if (is_array($attachments)) {
                foreach ($attachments as $file) {
                    if ($file instanceof \Illuminate\Http\UploadedFile) {
                        $message->attach($file->getRealPath(), [
                            'as' => $file->getClientOriginalName(),
                            'mime' => $file->getMimeType(),
                        ]);
                    }
                }
            }

            $symfony = $message->getSymfonyMessage();
            $headers = $symfony->getHeaders();

            if (is_string($inReplyTo) && $inReplyTo !== '') {
                $headers->addTextHeader('In-Reply-To', $inReplyTo);
            }
            if (is_string($referencesValue) && $referencesValue !== '') {
                $headers->addTextHeader('References', $referencesValue);
            }
        });

        $threadId = $data['threadId'] ?? null;
        DB::table('admin_sent_emails')->insert([
            'user_id' => $request->user()?->id,
            'to' => $to,
            'subject' => $subject,
            'body' => $validated['body'],
            'gmail_message_id' => $validated['gmail_message_id'],
            'thread_id' => is_string($threadId) ? $threadId : null,
            'cc' => empty($cc) ? null : implode(', ', $cc),
            'bcc' => empty($bcc) ? null : implode(', ', $bcc),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reply sent.',
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string',
            'body' => 'required|string',
            'cc' => 'nullable|string',
            'bcc' => 'nullable|string',
            'attachments' => 'sometimes|array',
            'attachments.*' => 'file|max:10240',
        ]);

        $fromAddress = config('mail.from_addresses.support') ?: config('mail.from.address');
        $fromName = config('mail.from.name');

        $bodyHtml = $this->formatEmailBody($validated['body']);
        $cc = $this->parseAddressList($validated['cc'] ?? null);
        $bcc = $this->parseAddressList($validated['bcc'] ?? null);
        $attachments = $request->file('attachments', []);

        Mail::send('emails.admin.manual', ['bodyHtml' => $bodyHtml], function ($message) use ($validated, $fromAddress, $fromName, $cc, $bcc, $attachments) {
            $message->to($validated['to']);
            if (!empty($cc)) {
                $message->cc($cc);
            }
            if (!empty($bcc)) {
                $message->bcc($bcc);
            }
            $message->subject($validated['subject']);

            if (is_string($fromAddress) && $fromAddress !== '') {
                $message->from($fromAddress, is_string($fromName) ? $fromName : null);
            }

            if (is_array($attachments)) {
                foreach ($attachments as $file) {
                    if ($file instanceof \Illuminate\Http\UploadedFile) {
                        $message->attach($file->getRealPath(), [
                            'as' => $file->getClientOriginalName(),
                            'mime' => $file->getMimeType(),
                        ]);
                    }
                }
            }
        });

        DB::table('admin_sent_emails')->insert([
            'user_id' => $request->user()?->id,
            'to' => $validated['to'],
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'gmail_message_id' => null,
            'thread_id' => null,
            'cc' => empty($cc) ? null : implode(', ', $cc),
            'bcc' => empty($bcc) ? null : implode(', ', $bcc),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Email sent.',
        ]);
    }

    public function sent(Request $request)
    {
        $max = (int) $request->query('max', 20);
        $max = max(1, min(50, $max));

        try {
            $items = DB::table('admin_sent_emails')
                ->orderByDesc('id')
                ->limit($max)
                ->get([
                    'id',
                    'to',
                    'subject',
                    'body',
                    'gmail_message_id',
                    'thread_id',
                    'created_at',
                ]);
        } catch (\Throwable) {
            $items = DB::table('admin_sent_emails')
                ->orderByDesc('id')
                ->limit($max)
                ->get([
                    'id',
                    'to',
                    'subject',
                    'body',
                    'gmail_message_id',
                    'created_at',
                ])
                ->map(function ($row) {
                    $row->thread_id = null;
                    return $row;
                });
        }

        return response()->json([
            'messages' => $items,
        ]);
    }

    public function sentShow(string $id)
    {
        $numericId = (int) $id;
        if ($numericId <= 0) {
            return response()->json([
                'message' => 'Invalid sent id.',
            ], 400);
        }

        try {
            $item = DB::table('admin_sent_emails')->where('id', $numericId)->first([
                'id',
                'to',
                'subject',
                'body',
                'gmail_message_id',
                'thread_id',
                'cc',
                'bcc',
                'created_at',
            ]);
        } catch (\Throwable) {
            $item = DB::table('admin_sent_emails')->where('id', $numericId)->first([
                'id',
                'to',
                'subject',
                'body',
                'gmail_message_id',
                'created_at',
            ]);
            if ($item) {
                $item->thread_id = null;
                $item->cc = null;
                $item->bcc = null;
            }
        }

        if (!$item) {
            return response()->json([
                'message' => 'Sent message not found.',
            ], 404);
        }

        $body = isset($item->body) && is_string($item->body) ? $item->body : '';
        $html = view('emails.admin.manual', ['bodyHtml' => $this->formatEmailBody($body)])->render();

        return response()->json([
            'message' => $item,
            'html' => $html,
        ]);
    }

    private function getToken(): ?array
    {
        $encrypted = Cache::get(self::TOKEN_CACHE_KEY);
        if (!is_string($encrypted) || $encrypted === '') {
            return null;
        }

        try {
            $json = Crypt::decryptString($encrypted);
            $token = json_decode($json, true);
            if (!is_array($token)) {
                return null;
            }
            return $token;
        } catch (\Throwable) {
            return null;
        }
    }

    private function getValidAccessToken(): ?string
    {
        $token = $this->getToken();
        if (!$token || !isset($token['access_token']) || !is_string($token['access_token'])) {
            return null;
        }

        $createdAt = isset($token['created_at']) ? (int) $token['created_at'] : 0;
        $expiresIn = isset($token['expires_in']) ? (int) $token['expires_in'] : 0;

        $expiresAt = $createdAt + $expiresIn;
        $isExpired = $expiresAt > 0 && $expiresAt <= (now()->timestamp + 60);

        if (!$isExpired) {
            return $token['access_token'];
        }

        $refreshToken = $token['refresh_token'] ?? null;
        if (!is_string($refreshToken) || $refreshToken === '') {
            return null;
        }

        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');

        if (!is_string($clientId) || $clientId === '' || !is_string($clientSecret) || $clientSecret === '') {
            return null;
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken,
        ]);

        if (!$response->successful()) {
            return null;
        }

        $refreshed = $response->json();
        if (!is_array($refreshed) || !isset($refreshed['access_token']) || !is_string($refreshed['access_token'])) {
            return null;
        }

        $token['access_token'] = $refreshed['access_token'];
        if (isset($refreshed['expires_in'])) {
            $token['expires_in'] = $refreshed['expires_in'];
        }
        $token['created_at'] = now()->timestamp;

        Cache::put(self::TOKEN_CACHE_KEY, Crypt::encryptString(json_encode($token)), now()->addDays(365));

        return $token['access_token'];
    }

    private function headersToMap($headers): array
    {
        $map = [];
        if (!is_array($headers)) {
            return $map;
        }

        foreach ($headers as $header) {
            if (!is_array($header)) {
                continue;
            }
            $name = $header['name'] ?? null;
            $value = $header['value'] ?? null;
            if (!is_string($name) || !is_string($value)) {
                continue;
            }
            $map[strtolower($name)] = $value;
        }

        return $map;
    }

    private function extractEmailAddress(string $raw): ?string
    {
        if ($raw === '') {
            return null;
        }

        if (preg_match('/<([^>]+)>/', $raw, $matches) === 1) {
            return trim($matches[1]);
        }

        if (filter_var(trim($raw), FILTER_VALIDATE_EMAIL)) {
            return trim($raw);
        }

        return null;
    }

    private function ensureReplySubject(string $subject): string
    {
        $trimmed = trim($subject);
        if ($trimmed === '') {
            return 'Re:';
        }

        if (preg_match('/^\s*re:/i', $trimmed) === 1) {
            return $trimmed;
        }

        return 'Re: '.$trimmed;
    }

    private function buildReferences(?string $references, ?string $messageId): ?string
    {
        $parts = [];
        if (is_string($references) && trim($references) !== '') {
            $parts = preg_split('/\s+/', trim($references)) ?: [];
        }
        if (is_string($messageId) && trim($messageId) !== '') {
            $parts[] = trim($messageId);
        }

        $unique = [];
        foreach ($parts as $p) {
            if (!is_string($p) || $p === '') {
                continue;
            }
            $unique[$p] = true;
        }

        $result = implode(' ', array_keys($unique));
        return $result !== '' ? $result : null;
    }

    private function extractBodies($payload): array
    {
        $text = null;
        $html = null;

        if (is_array($payload)) {
            $mimeType = $payload['mimeType'] ?? null;
            $bodyData = $payload['body']['data'] ?? null;

            if (is_string($mimeType) && is_string($bodyData) && $bodyData !== '') {
                $decoded = $this->base64UrlDecode($bodyData);
                if ($mimeType === 'text/plain') {
                    $text = $decoded;
                }
                if ($mimeType === 'text/html') {
                    $html = $decoded;
                }
            }

            $parts = $payload['parts'] ?? null;
            if (is_array($parts)) {
                foreach ($parts as $part) {
                    $nested = $this->extractBodies($part);
                    if (!is_string($text) && isset($nested['text']) && is_string($nested['text']) && $nested['text'] !== '') {
                        $text = $nested['text'];
                    }
                    if (!is_string($html) && isset($nested['html']) && is_string($nested['html']) && $nested['html'] !== '') {
                        $html = $nested['html'];
                    }
                }
            }
        }

        return [
            'text' => $text,
            'html' => $html,
        ];
    }

    private function extractAttachments($payload): array
    {
        $attachments = [];

        if (!is_array($payload)) {
            return $attachments;
        }

        $filename = $payload['filename'] ?? null;
        $mimeType = $payload['mimeType'] ?? null;
        $body = $payload['body'] ?? null;

        if (
            is_string($filename) && $filename !== '' &&
            is_string($mimeType) && $mimeType !== '' &&
            is_array($body) &&
            isset($body['attachmentId']) && is_string($body['attachmentId']) && $body['attachmentId'] !== ''
        ) {
            $headers = $this->headersToMap($payload['headers'] ?? []);
            $cidRaw = $headers['content-id'] ?? null;
            $cid = is_string($cidRaw) ? trim($cidRaw, " <>") : null;
            $disp = $headers['content-disposition'] ?? null;
            $inline = is_string($disp) ? stripos($disp, 'inline') !== false : false;

            $attachments[] = [
                'attachment_id' => $body['attachmentId'],
                'filename' => $filename,
                'mime_type' => $mimeType,
                'size' => isset($body['size']) && is_int($body['size']) ? $body['size'] : null,
                'cid' => $cid,
                'inline' => $inline,
            ];
        }

        $parts = $payload['parts'] ?? null;
        if (is_array($parts)) {
            foreach ($parts as $part) {
                $nested = $this->extractAttachments($part);
                if (!empty($nested)) {
                    $attachments = array_merge($attachments, $nested);
                }
            }
        }

        return $attachments;
    }

    private function findAttachmentMeta(string $accessToken, string $messageId, string $attachmentId): array
    {
        $res = Http::withToken($accessToken)->get('https://gmail.googleapis.com/gmail/v1/users/me/messages/'.$messageId, [
            'format' => 'full',
        ]);

        if (!$res->successful()) {
            return [];
        }

        $data = $res->json();
        if (!is_array($data) || !isset($data['payload']) || !is_array($data['payload'])) {
            return [];
        }

        return $this->findAttachmentMetaInPayload($data['payload'], $attachmentId);
    }

    private function findAttachmentMetaInPayload($payload, string $attachmentId): array
    {
        if (!is_array($payload)) {
            return [];
        }

        $body = $payload['body'] ?? null;
        if (is_array($body) && isset($body['attachmentId']) && $body['attachmentId'] === $attachmentId) {
            $filename = $payload['filename'] ?? null;
            $mimeType = $payload['mimeType'] ?? null;
            return [
                'filename' => is_string($filename) ? $filename : null,
                'mime_type' => is_string($mimeType) ? $mimeType : null,
            ];
        }

        $parts = $payload['parts'] ?? null;
        if (is_array($parts)) {
            foreach ($parts as $part) {
                $found = $this->findAttachmentMetaInPayload($part, $attachmentId);
                if (!empty($found)) {
                    return $found;
                }
            }
        }

        return [];
    }

    private function moveMessagesFromSpamToInbox(string $accessToken, array $messageIds): int
    {
        $moved = 0;
        foreach ($messageIds as $id) {
            if (!is_string($id) || $id === '') {
                continue;
            }

            $res = Http::withToken($accessToken)->post('https://gmail.googleapis.com/gmail/v1/users/me/messages/'.$id.'/modify', [
                'removeLabelIds' => ['SPAM'],
                'addLabelIds' => ['INBOX'],
            ]);

            if ($res->successful()) {
                $moved++;
            }
        }

        return $moved;
    }

    private function isClientEmail(string $email): bool
    {
        $email = strtolower(trim($email));
        if ($email === '') {
            return false;
        }

        static $cache = [];
        if (array_key_exists($email, $cache)) {
            return (bool) $cache[$email];
        }

        try {
            $exists = DB::table('users')
                ->whereRaw('lower(email) = ?', [$email])
                ->where('role', 'customer')
                ->exists();
        } catch (\Throwable) {
            $exists = false;
        }

        $cache[$email] = $exists;
        return $exists;
    }

    private function base64UrlDecode(string $data): string
    {
        $normalized = strtr($data, '-_', '+/');
        $pad = strlen($normalized) % 4;
        if ($pad > 0) {
            $normalized .= str_repeat('=', 4 - $pad);
        }

        $decoded = base64_decode($normalized, true);
        return is_string($decoded) ? $decoded : '';
    }

    private function parseAddressList($raw): array
    {
        if (!is_string($raw)) {
            return [];
        }

        $parts = preg_split('/[,\n;]/', $raw) ?: [];
        $emails = [];
        foreach ($parts as $p) {
            $p = trim($p);
            if ($p === '') {
                continue;
            }

            if (filter_var($p, FILTER_VALIDATE_EMAIL)) {
                $emails[] = $p;
            }
        }

        $unique = [];
        foreach ($emails as $e) {
            $unique[strtolower($e)] = $e;
        }

        return array_values($unique);
    }

    private function formatEmailBody(string $raw): string
    {
        $escaped = e($raw);

        $escaped = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $escaped) ?? $escaped;
        $escaped = preg_replace('/__(.+?)__/s', '<strong>$1</strong>', $escaped) ?? $escaped;
        $escaped = preg_replace('/\*(.+?)\*/s', '<em>$1</em>', $escaped) ?? $escaped;
        $escaped = preg_replace('/_(.+?)_/s', '<em>$1</em>', $escaped) ?? $escaped;

        $escaped = preg_replace_callback('/(https?:\/\/[^\s<]+)/i', function ($m) {
            $url = $m[1];
            $safe = e($url);
            return '<a href="'.$safe.'" style="color:#188655;text-decoration:none;" target="_blank" rel="noopener noreferrer">'.$safe.'</a>';
        }, $escaped) ?? $escaped;

        return nl2br($escaped);
    }
}
