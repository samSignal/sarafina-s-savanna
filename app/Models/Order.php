<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'total',
        'total_amount',
        'status',
        'payment_status',
        'shipping_method',
        'shipping_address_line1',
        'shipping_address_line2',
        'shipping_city',
        'shipping_postcode',
        'shipping_country',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
