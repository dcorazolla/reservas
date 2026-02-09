<?php

namespace App\Policies;

use App\Models\User;
use App\Models\RoomBlock;

class RoomBlockPolicy
{
    /**
     * Determine whether the user can create a room block.
     */
    public function create(User $user)
    {
        // Allow if user is associated with a property (staff) — conservative default
        return $user->property_id !== null;
    }

    /**
     * Determine whether the user can delete the room block.
     */
    public function delete(User $user, RoomBlock $block)
    {
        // Allow if the user belongs to same property as the room's property
        return $user->property_id !== null && $user->property_id === $block->room->property_id;
    }

    /**
     * Determine whether the user can update the room block.
     */
    public function update(User $user, RoomBlock $block)
    {
        return $this->delete($user, $block);
    }
}
