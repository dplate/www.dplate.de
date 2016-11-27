# www.dplate.de - Website

### Used color scheme

https://coolors.co/1f363d-40798c-70a9a1-9ec1a3-cfe0c3

### Build

Install required dependencies:

    npm run setup

### Start the development server

This command serves the app at `http://localhost:8080` and provides basic URL
routing for the app:

    npm run dev

### Build

Collects the required `fragments` and call `polymer build`:

    npm run build
    
### Import article from a forum

    npm -s run import -- "{url}" {destination} [overwrite]
    npm -s run import -- "http://www.alpinforum.com/forum/viewtopic.php?f=46&t=52670" montafon


