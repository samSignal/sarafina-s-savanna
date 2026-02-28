<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class GiftCard extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'initial_value',
        'balance',
        'status',
        'expiry_date',
        'recipient_email',
        'sender_name',
        'message',
        'purchaser_id',
        'order_id'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'initial_value' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function transactions()
    {
        return $this->hasMany(GiftCardTransaction::class);
    }

    public function purchaser()
    {
        return $this->belongsTo(User::class, 'purchaser_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public static function generateCode()
    {
        // SARAFINA-XXXX-XXXX
        do {
            $code = 'SARAFINA-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4));
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
