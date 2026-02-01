export function rdfMarkdownPlugin(md: any) {
    const defaultFence = md.renderer.rules.fence;

    md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx];
        const infoRaw = token.info.trim();
        // Split by whitespace to get lang and modifiers
        const parts = infoRaw.split(/\s+/);
        const lang = parts[0].toLowerCase();
        const modifiers = parts.slice(1).map((p: string) => p.toLowerCase());

        const content = token.content;

        // Supported languages
        if (['turtle', 'n3', 'ntriples', 'rdf', 'trig'].includes(lang)) {
            const isGraph = modifiers.includes('graph');
            const isPreview = modifiers.includes('preview');

            if (isGraph || isPreview) {
                const config = {
                    noLiterals: modifiers.includes('no-literals'),
                    noExternal: modifiers.includes('no-external'),
                    noClasses: modifiers.includes('no-classes'),
                    noInstances: modifiers.includes('no-instances')
                };
                const configStr = encodeURIComponent(JSON.stringify(config));
                const graphDiv = `<div class="semantic-graph" data-content="${encodeURIComponent(content)}" data-config="${configStr}"></div>`;

                if (isGraph) {
                    return graphDiv;
                }
                // isPreview
                const codeHtml = defaultFence(tokens, idx, options, env, self);
                return codeHtml + graphDiv;
            }
        }

        return defaultFence(tokens, idx, options, env, self);
    };
}
