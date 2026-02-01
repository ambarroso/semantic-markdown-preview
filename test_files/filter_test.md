# Turtle Syntax Test

## 3. Filtering Options

### No Literals
```turtle preview no-literals
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:Person a ex:Class .
ex:John a ex:Person ;
    ex:name "John Doe" ;
    ex:age 30 .
```

### No External Classes
```turtle preview no-external
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:John a ex:Person .
ex:John a foaf:Person .
```

### No Instances (Only structure)
```turtle preview no-instances
@prefix ex: <http://example.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

ex:Person a rdfs:Class .
ex:Employee rdfs:subClassOf ex:Person .
ex:John a ex:Employee .
```
