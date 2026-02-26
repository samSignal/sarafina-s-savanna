<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltySetting extends Model
{
    protected $fillable = ['max_redemption_percentage', 'min_order_amount_gbp'];
}

