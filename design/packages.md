# Packages

A code package, such as an npm package, NuGet package, or Go module, is a self-contained collection of code, dependencies, and metadata that can be easily distributed, installed, and reused within software projects.

# Published to a package manager

Packages published to a package manager can live anywhere inside a mono repo.  They are not limited by downloading them from git. These can be located inside the domain folder.

Some package 

## Published to github

Some packages do not require a package repository and can be installed straight from git.  NPM and go are examples of these.  It is very convenient to push and tag your packages. This is very straight forward when the package is the root of the repository. It is a little more complicated in a mono repository.   Packages need to be in a folder in the root of the repo and cannot be nested more than that first level.  I would prefer to put the packages into the domain folder that they belong to, but it is a limitation of the technology.  I think given the ease of publishing packages to github, it is a worthy trade off.


## Verbs

* test
    * execute unit tests
* publish
    * publish versioned shared code like npm packages, go modules, and nuget packages. 
* verify
    * execute integration tests
