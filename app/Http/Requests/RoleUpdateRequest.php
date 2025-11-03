<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class RoleUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->user()->can('updaterole');
    }

    public function rules()
    {
        $available = Permission::pluck('name')->toArray();

        return [
            'name' => ['required', 'max:50', Rule::unique('roles','name')->ignore($this->route('role')->id)],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in($available)],
        ];
    }
}
