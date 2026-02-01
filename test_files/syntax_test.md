# Semantic Syntax Highlighting & Graph Test

This file tests various RDF features to ensure the highlighter is accurate and Graph Visualization is correct.
**Note:** Each block is self-contained to ensure proper rendering.

## 1. Prefixes & Directives (Syntax Check)
```turtle preview
@prefix : <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@base <http://example.org/> .

PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
BASE <http://example.org/>

:SyntaxCheck :status "OK" .
```

## 2. Literals & Datatypes (Color Check)
```turtle preview
@prefix : <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

:Types :test "Simple String" ;           # Green
       :lang "Bonjour"@fr ;              # Green string
       :int 123, -456 ;                  # Orange
       :decimal 123.45 ;                 # Orange
       :scientific 1.23e-4, -1.0E+5 ;    # Orange (Scientific)
       :bool true, false ;               # Orange
       :typed "2023-01-01"^^xsd:date .   # String Green, Type Teal
```

## 3. Complex Nesting (Syntax Check)
```turtle preview
@prefix : <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

:Complex :hasList ( 1 2 3 ) .            # Collection
:Complex :hasGrid ( (1 2) (3 4) ) .      # Nested Collection

:Anonymous :node [
    a foaf:Person ;
    foaf:name "Anonymous List";
    foaf:knows [
        a foaf:Person;
        foaf:name "Nested Friend"
    ]
] .
```

## 4. Semantic Graph Visualization Test
**Goal:** Verify Colors.
- **Classes** (:Person, :Mammal): **Yellow Ellipse**
- **Instances** (:Alice, :Bob): **Dark Blue Ellipse**
- **rdf:type** (a): **Solid Edge**
- **subClassOf**: **Hollow Edge**

```turtle preview
@prefix : <http://example.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

# Metamodel (Classes)
:Mammal a rdfs:Class .
:Person rdfs:subClassOf :Mammal .
:Professor rdfs:subClassOf :Person .

# Data (Instances)
:Alice a :Professor ;
    :age 30 ;
    :name "Alice" .

:Bob a :Person ;
    :name "Bob" ;
    :knows :Alice .

:Charlie a :Person ;
    :knows :Bob .
```
