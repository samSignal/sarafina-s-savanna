<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'total',
        'total_amount',
        'currency',
        'exchange_rate',
        'total_gbp',
        'status',
        'payment_status',
        'shipping_method',
        'shipping_address_line1',
        'shipping_address_line2',
        'shipping_city',
        'shipping_postcode',
        'shipping_country',
        'delivery_cost',
        'delivery_status',
        'estimated_delivery_date',
        'contact_person',
        'contact_phone',
        'points_redeemed',
        'discount_amount',
        'points_earned',
    ];

    protected $casts = [
        'estimated_delivery_date' => 'datetime',
        'discount_amount' => 'decimal:2',
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
