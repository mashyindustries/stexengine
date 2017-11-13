## Setup

```
var StexEngine = require('stexengine')

var config = {
    directory: //view directory
}

var engine = StexEngine(config)

```

## Views

In your view directory, you can seperate view types with folders such as:

```
views/includes
views/pages
views/layouts
```

### Defining a layout
`layouts/app.stex`

```
<html>
    <head>
        <title>@yield('title')</title>
    </head>
    <body>
        <h1>
            @yield('title')
        </h1>
        <div>
            @yield('content')
        </div>
    </body>
<html>
```

### Extending a layout
'pages/home.stex`

```
@extend('layouts/app')

@section('title')
    Home Page
@endsection

@section('content')
    This is the home page body
@endsection
```

### Returning a view
```
engine.render('pages/home');
```