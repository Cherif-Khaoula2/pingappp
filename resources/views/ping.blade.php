<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Ping Tool</title>
    @viteReactRefresh
    @vite('resources/js/app.jsx')
</head>
<body>
    <div id="app"></div>

    <script type="module">
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import PingApp from '/resources/js/components/PingApp.jsx';

        const props = {
            result: `{!! $result ?? '' !!}`,
            address: "{{ $address ?? '' }}"
        };

        createRoot(document.getElementById('app')).render(<PingApp {...props} />);
    </script>
</body>
</html>
