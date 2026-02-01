# Semantic Markdown Preview Demo

This file demonstrates the new tagging system using `Language + Modifier`.

## 1. Code Only (Standard)
Use the standard `turtle` or `n3` tag. VS Code provides syntax highlighting natively.

```turtle
@prefix : <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

:Alice a foaf:Person ;
    foaf:name "Alice" ;
    foaf:knows :Bob .
```

## 2. Preview Mode (Code + Graph)
Use `turtle preview` to see both the source code and the visual graph.

```turtle preview
@prefix : <http://example.org/> .
@prefix schema: <http://schema.org/> .

:ProjectX a schema:Project ;
    schema:name "Top Secret" ;
    schema:employee :AgentK, :AgentJ .

:AgentK schema:mentor :AgentJ .
```

## 3. Graph Mode (Graph Only)
Use `turtle graph` to hide the code and show only the visualization.

```turtle graph
@prefix : <http://example.org/> .
:A :connectedTo :B .
:B :connectedTo :C .
:C :connectedTo :A .
```

## 4. N3 Support
The same works for `n3`.

```n3 preview
@prefix : <http://example.org/> .
:N3 :is :Cool .
```