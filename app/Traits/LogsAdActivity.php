<?php

namespace App\Traits;

use App\Models\AdActivityLog;

trait LogsAdActivity
{
    protected function logAdActivity(
        string $action,
        string $targetUser,
        ?string $targetUserName = null,
        bool $success = true,
        ?string $errorMessage = null,
        ?array $additionalDetails = null
    ): void {
        AdActivityLog::logAction(
            action: $action,
            targetUser: $targetUser,
            targetUserName: $targetUserName,
            details: $additionalDetails,
            status: $success ? 'success' : 'failed',
            errorMessage: $errorMessage
        );
    }
}