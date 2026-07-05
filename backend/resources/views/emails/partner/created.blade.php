<x-mail::message>
# Welcome to the Partner Program!

Hi {{ $name }},

An administrator has successfully created your Partner account. You can now log in to your Partner Portal to start referring businesses and tracking your commissions!

Here are your account details:

**Email:** {{ $email }}<br>
**Password:** {{ $password }}

<x-mail::panel>
We recommend changing your password after your first login via your Profile & Settings page.
</x-mail::panel>

<x-mail::button :url="$loginUrl" color="primary">
Log in to Partner Portal
</x-mail::button>

If you have any questions, please reach out to our support team.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
