<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class RoleStoreRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->user()->can('addrole');
    }

    public function rules()
    {
        $available = Permission::pluck('name')->toArray();

        return [
            'name' => ['required', 'max:50', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in($available)],
        ];
    }
}
