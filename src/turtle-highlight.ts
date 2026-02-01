/*
Language: Turtle
Author: Mark Ellis <mark.ellis@stardog.com> (based on work by Redmer Kleijn <redmer@redmer.org>)
Category: common
*/

export default function (hljs: any) {
    var DIRECTIVES = {
        className: 'keyword', // Purple/Magenta
        begin: /@\s*(prefix|base)/,
        relevance: 10,
        case_insensitive: true
    };

    var STANDARD_DIRECTIVES = {
        className: 'keyword',
        begin: /(?<!\w)(BASE|PREFIX)(?!\w)/, // use word boundaries or logic
        relevance: 10
    };

    var TYPE_A = {
        className: 'keyword', // Purple/Magenta
        begin: /\ba\b/,
        relevance: 0
    };

    var BOOLS = {
        className: 'literal', // Red/Orange
        begin: /\b(true|false)\b/,
        relevance: 0
    };

    var IRI_LITERAL = {
        className: 'link', // Blue
        begin: /<[^>]*>/,
        relevance: 1
    };

    // "ex:" or ":" - Prefix Labels -> Orange/Gold
    var PNAME_NS = {
        className: 'title',
        begin: /[a-zA-Z0-9_\-]*:/
    };

    // "Person" - Local Names -> Cyan/Teal
    // Must be lower priority than numbers/keywords if they overlap, but here we rely on keywords engine or order.
    var PNAME_LOCAL = {
        className: 'symbol',
        begin: /[a-zA-Z0-9_\-]+/,
        relevance: 0
    };

    var DATATYPE = {
        className: 'type', // Numbers/Bool color? Or Type color. User didn't specify Type. Let's use Cyan/Teal (symbol) or maybe Orange.
        begin: /\^\^/
    };

    var TRIPLE_QUOTED_STRING = {
        className: 'string', // Green
        begin: /"""/, end: /"""/,
        relevance: 10
    };

    var DOUBLE_QUOTED_STRING = {
        className: 'string', // Green
        begin: /"/, end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE]
    };

    var NUMBER = {
        className: 'number', // Red/Orange
        begin: /[\+\-]?\d+(\.\d+)?([eE][\+\-]?\d+)?/,
        relevance: 0
    };

    return {
        name: 'Turtle',
        case_insensitive: true,
        aliases: ['turtle', 'ttl', 'n3', 'rdf'],
        contains: [
            DIRECTIVES, // @prefix
            STANDARD_DIRECTIVES, // PREFIX
            TYPE_A,      // a (Purple) - High priority to beat PNAME_LOCAL
            BOOLS,       // true/false (Red/Orange)
            IRI_LITERAL, // <uri>
            DATATYPE,
            TRIPLE_QUOTED_STRING,
            DOUBLE_QUOTED_STRING,
            NUMBER,
            PNAME_NS,    // ex:
            PNAME_LOCAL, // Person
            hljs.HASH_COMMENT_MODE
        ]
    };
}
