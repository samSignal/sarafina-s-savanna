<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiftCardAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'gift_card_id',
        'user_id',
        'action',
        'details',
        'ip_address',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    public function giftCard()
    {
        return $this->belongsTo(GiftCard::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
