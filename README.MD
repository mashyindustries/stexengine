# Setup

```
var StexEngine = require('stexengine')

var config = {
    basedir: *views directory*
}

var engine = StexEngine(config)

```

## Rendering a view

```
engine.render('pages/home');

engine.render('pages/home', {"title": "Hello World"});
```

## Views

### View Structure

In your view directory, we recommend seperating view types with folders as shown below:

```
views/includes
views/pages
views/layouts
```

### Defining a layout
`layouts/master.stex`

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
`pages/home.stex`

```
@extend('layouts/app')

@section('title')
    Home Page
@endsection

@section('content')
    This is the home page body
@endsection
```

### Including Sections
`includes/header.stex`
```
<header>This is a Header</header>
```
`Using in a view`
```
...
@includes('includes.header')
...
```