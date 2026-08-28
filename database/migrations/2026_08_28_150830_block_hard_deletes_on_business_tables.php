<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Soft-delete (SoftDeletes trait -> UPDATE deleted_at) is only an application-layer
 * convention -- it does nothing to stop a DELETE run directly against the database. These
 * triggers make hard deletes fail outright at the database engine itself, on every table
 * that holds real business/customer data, whether the DELETE comes from the app or a raw
 * DB console. Deliberately purging a row (e.g. a GDPR erasure request) means temporarily
 * dropping the specific trigger, doing the delete, and recreating it -- a conscious,
 * one-off action rather than something that can happen by accident.
 *
 * NOTE: CREATE TRIGGER requires the SUPER privilege (or TRIGGER privilege plus
 * log_bin_trust_function_creators=1) when binary logging is enabled -- the app's normal DB
 * user does not have this. On a fresh environment, run this migration's up() SQL manually
 * as a privileged user (e.g. `sudo mysql <database> < the CREATE TRIGGER statements`), then
 * record it as applied in the `migrations` table so `artisan migrate` doesn't retry it.
 * The app's regular DB user needs no special privilege afterward -- triggers fire for any
 * user's DELETE once created.
 */
return new class extends Migration
{
    private array $tables = [
        'products',
        'categories',
        'departments',
        'gift_cards',
        'refunds',
        'users',
        'orders',
        'promotions',
        'banners',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            DB::unprepared(<<<SQL
                CREATE TRIGGER trg_block_hard_delete_{$table}
                BEFORE DELETE ON {$table}
                FOR EACH ROW
                BEGIN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Hard deletes are disabled on {$table}. Use soft delete (UPDATE deleted_at) instead.';
                END
            SQL);
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            DB::unprepared("DROP TRIGGER IF EXISTS trg_block_hard_delete_{$table}");
        }
    }
};
