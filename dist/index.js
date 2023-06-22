"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// src/options.ts
var import_node_path = __toESM(require("path"));
var import_vite = require("vite");
var resolveOptions = (options) => {
  const themeRoot = options.themeRoot ?? "./";
  const sourceCodeDir = options.sourceCodeDir ?? "frontend";
  const entrypointsDir = options.entrypointsDir ?? (0, import_vite.normalizePath)(import_node_path.default.join(sourceCodeDir, "entrypoints"));
  const additionalEntrypoints = options.additionalEntrypoints ?? [];
  const snippetFile = options.snippetFile ?? "vite-tag.liquid";
  return {
    themeRoot,
    sourceCodeDir,
    entrypointsDir,
    additionalEntrypoints,
    snippetFile
  };
};

// src/config.ts
var import_node_path2 = __toESM(require("path"));
var import_vite2 = require("vite");
var import_fast_glob = __toESM(require("fast-glob"));
var import_debug = __toESM(require("debug"));
var debug = (0, import_debug.default)("vite-plugin-shopify:config");
function shopifyConfig(options) {
  return {
    name: "vite-plugin-shopify-config",
    config(config) {
      const host = config.server?.host ?? "localhost";
      const port = config.server?.port ?? 5173;
      const https = config.server?.https ?? false;
      const origin = config.server?.origin ?? "__shopify_vite_placeholder__";
      const socketProtocol = https === false ? "ws" : "wss";
      const defaultAliases = {
        "~": import_node_path2.default.resolve(options.sourceCodeDir),
        "@": import_node_path2.default.resolve(options.sourceCodeDir)
      };
      const input = import_fast_glob.default.sync([
        (0, import_vite2.normalizePath)(import_node_path2.default.join(options.entrypointsDir, "**/*")),
        ...options.additionalEntrypoints
      ], { onlyFiles: true });
      const generatedConfig = {
        // Use relative base path so to load imported assets from Shopify CDN
        base: config.base ?? "./",
        // Do not use "public" directory
        publicDir: config.publicDir ?? false,
        build: {
          // Output files to "assets" directory
          outDir: config.build?.outDir ?? import_node_path2.default.join(options.themeRoot, "assets"),
          // Do not use subfolder for static assets
          assetsDir: config.build?.assetsDir ?? "",
          // Configure bundle entry points
          rollupOptions: {
            input: config.build?.rollupOptions?.input ?? input
          },
          // Output manifest file for backend integration
          manifest: config.build?.manifest ?? true
        },
        resolve: {
          // Provide import alias to source code dir for convenience
          alias: Array.isArray(config.resolve?.alias) ? [
            ...config.resolve?.alias ?? [],
            ...Object.keys(defaultAliases).map((alias) => ({
              find: alias,
              replacement: defaultAliases[alias]
            }))
          ] : {
            ...defaultAliases,
            ...config.resolve?.alias
          }
        },
        server: {
          host,
          https,
          port,
          origin,
          strictPort: config.server?.strictPort ?? true,
          hmr: config.server?.hmr === false ? false : {
            host: typeof host === "string" ? host : void 0,
            port,
            protocol: socketProtocol,
            ...config.server?.hmr === true ? {} : config.server?.hmr
          }
        }
      };
      debug(generatedConfig);
      return generatedConfig;
    }
  };
}

// src/html.ts
var import_node_fs = __toESM(require("fs"));
var import_node_path3 = __toESM(require("path"));
var import_node_url = require("url");
var import_vite3 = require("vite");
var import_debug2 = __toESM(require("debug"));

// src/constants.ts
var KNOWN_CSS_EXTENSIONS = [
  "css",
  "less",
  "sass",
  "scss",
  "styl",
  "stylus",
  "pcss",
  "postcss"
];
var CSS_EXTENSIONS_REGEX = new RegExp(
  `\\.(${KNOWN_CSS_EXTENSIONS.join("|")})(\\?.+)?$`
);

// src/html.ts
var import_meta = {};
var debug2 = (0, import_debug2.default)("vite-plugin-shopify:html");
var _dirname = typeof __dirname !== "undefined" ? __dirname : import_node_path3.default.dirname((0, import_node_url.fileURLToPath)(import_meta.url));
function shopifyHTML(options) {
  let config;
  let viteDevServerUrl;
  const viteTagSnippetPath = import_node_path3.default.resolve(options.themeRoot, `snippets/${options.snippetFile}`);
  const viteTagSnippetName = options.snippetFile.replace(/\.[^.]+$/, "");
  return {
    name: "vite-plugin-shopify-html",
    enforce: "post",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transform(code) {
      if (config.command === "serve") {
        return code.replace(/__shopify_vite_placeholder__/g, viteDevServerUrl);
      }
    },
    configureServer({ config: config2, middlewares, httpServer }) {
      httpServer?.once("listening", () => {
        const address = httpServer?.address();
        const isAddressInfo = (x) => typeof x === "object";
        if (isAddressInfo(address)) {
          viteDevServerUrl = resolveDevServerUrl(address, config2);
          debug2({ address, viteDevServerUrl });
          const reactPlugin = config2.plugins.find((plugin) => plugin.name === "vite:react-babel" || plugin.name === "vite:react-refresh");
          const viteTagSnippetContent = viteTagDisclaimer + viteTagEntryPath(config2.resolve.alias, options.entrypointsDir, viteTagSnippetName) + viteTagSnippetDev(viteDevServerUrl, options.entrypointsDir, reactPlugin);
          import_node_fs.default.writeFileSync(viteTagSnippetPath, viteTagSnippetContent);
        }
      });
      return () => middlewares.use((req, res, next) => {
        if (req.url === "/index.html") {
          res.statusCode = 404;
          res.end(
            import_node_fs.default.readFileSync(import_node_path3.default.join(_dirname, "dev-server-index.html")).toString()
          );
        }
        next();
      });
    },
    closeBundle() {
      if (config.command === "serve") {
        return;
      }
      const manifestFilePath = import_node_path3.default.resolve(options.themeRoot, "assets/manifest.json");
      if (!import_node_fs.default.existsSync(manifestFilePath)) {
        return;
      }
      const assetTags = [];
      const manifest = JSON.parse(
        import_node_fs.default.readFileSync(manifestFilePath, "utf8")
      );
      Object.keys(manifest).forEach((src) => {
        const { file, isEntry, css, imports } = manifest[src];
        const ext = import_node_path3.default.extname(src);
        if (isEntry === true) {
          const entryName = (0, import_vite3.normalizePath)(import_node_path3.default.relative(options.entrypointsDir, src));
          const entryPaths = [`/${src}`, entryName];
          const tagsForEntry = [];
          if (ext.match(CSS_EXTENSIONS_REGEX) !== null) {
            tagsForEntry.push(stylesheetTag(file));
          } else {
            tagsForEntry.push(scriptTag(file));
            if (typeof css !== "undefined" && css.length > 0) {
              css.forEach((cssFileName) => {
                tagsForEntry.push(stylesheetTag(cssFileName));
              });
            }
            if (typeof imports !== "undefined" && imports.length > 0) {
              imports.forEach((importFilename) => {
                const chunk = manifest[importFilename];
                const { css: css2 } = chunk;
                tagsForEntry.push(preloadScriptTag(chunk.file));
                if (typeof css2 !== "undefined" && css2.length > 0) {
                  css2.forEach((cssFileName) => {
                    tagsForEntry.push(stylesheetTag(cssFileName));
                  });
                }
              });
            }
          }
          assetTags.push(viteEntryTag(entryPaths, tagsForEntry.join("\n  "), assetTags.length === 0));
        }
        if (src === "style.css" && !config.build.cssCodeSplit) {
          assetTags.push(viteEntryTag([src], stylesheetTag(file), false));
        }
      });
      const viteTagSnippetContent = viteTagDisclaimer + viteTagEntryPath(config.resolve.alias, options.entrypointsDir, viteTagSnippetName) + assetTags.join("\n") + "\n{% endif %}\n";
      import_node_fs.default.writeFileSync(viteTagSnippetPath, viteTagSnippetContent);
    }
  };
}
var viteTagDisclaimer = "{% comment %}\n  IMPORTANT: This snippet is automatically generated by vite-plugin-shopify.\n  Do not attempt to modify this file directly, as any changes will be overwritten by the next build.\n{% endcomment %}\n";
var viteTagEntryPath = (resolveAlias, entrypointsDir, snippetName) => {
  const replacements = [];
  resolveAlias.forEach((alias) => {
    if (typeof alias.find === "string") {
      replacements.push([alias.find, (0, import_vite3.normalizePath)(import_node_path3.default.relative(entrypointsDir, alias.replacement))]);
    }
  });
  return `{% assign path = ${snippetName} | ${replacements.map(([from, to]) => `replace: '${from}/', '${to}/'`).join(" | ")} %}
`;
};
var viteEntryTag = (entryPaths, tag, isFirstEntry = false) => `{% ${!isFirstEntry ? "els" : ""}if ${entryPaths.map((entryName) => `path == "${entryName}"`).join(" or ")} %}
  ${tag}`;
var preloadScriptTag = (fileName) => `<link rel="modulepreload" href="{{ '${fileName}' | asset_url | split: '?' | first }}" crossorigin="anonymous">`;
var scriptTag = (fileName) => `<script src="{{ '${fileName}' | asset_url | split: '?' | first }}" type="module" crossorigin="anonymous"></script>`;
var stylesheetTag = (fileName) => `{{ '${fileName}' | asset_url | split: '?' | first | stylesheet_tag: preload: preload_stylesheet }}`;
var viteTagSnippetDev = (assetHost, entrypointsDir, reactPlugin) => `{% liquid
  assign path_prefix = path | slice: 0
  if path_prefix == '/'
    assign file_url_prefix = '${assetHost}'
  else
    assign file_url_prefix = '${assetHost}/${entrypointsDir}/'
  endif
  assign file_url = path | prepend: file_url_prefix
  assign file_name = path | split: '/' | last
  if file_name contains '.'
    assign file_extension = file_name | split: '.' | last
  endif
  assign css_extensions = '${KNOWN_CSS_EXTENSIONS.join("|")}' | split: '|'
  assign is_css = false
  if css_extensions contains file_extension
    assign is_css = true
  endif
%}${reactPlugin === void 0 ? "" : `
<script src="${assetHost}/@id/__x00__vite-plugin-shopify:react-refresh" type="module"></script>`}
<script src="${assetHost}/@vite/client" type="module"></script>
{% if is_css == true %}
  {{ file_url | stylesheet_tag }}
{% else %}
  <script src="{{ file_url }}" type="module"></script>
{% endif %}
`;
function resolveDevServerUrl(address, config) {
  const configHmrProtocol = typeof config.server.hmr === "object" ? config.server.hmr.protocol : null;
  const clientProtocol = configHmrProtocol !== null ? configHmrProtocol === "wss" ? "https" : "http" : null;
  const serverProtocol = config.server.https !== false ? "https" : "http";
  const protocol = clientProtocol ?? serverProtocol;
  const configHmrHost = typeof config.server.hmr === "object" ? config.server.hmr.host : null;
  const configHost = typeof config.server.host === "string" ? config.server.host : null;
  const serverAddress = isIpv6(address) ? `[${address.address}]` : address.address;
  const host = configHmrHost ?? configHost ?? serverAddress;
  const configHmrClientPort = typeof config.server.hmr === "object" ? config.server.hmr.clientPort : null;
  const port = configHmrClientPort ?? address.port;
  return `${protocol}://${host}:${port}`;
}
function isIpv6(address) {
  return address.family === "IPv6" || // In node >=18.0 <18.4 this was an integer value. This was changed in a minor version.
  // See: https://github.com/laravel/vite-plugin/issues/103
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error-next-line
  address.family === 6;
}

// src/react-refresh.ts
function shopifyReactRefresh() {
  const virtualModuleId = "vite-plugin-shopify:react-refresh";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  return {
    name: "vite-plugin-shopify:react-refresh",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `
          import RefreshRuntime from '__shopify_vite_placeholder__/@react-refresh'
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true
        `;
      }
    }
  };
}

// src/index.ts
var vitePluginShopify = (options = {}) => {
  const resolvedOptions = resolveOptions(options);
  const plugins = [
    // Apply plugin for configuring Vite settings
    shopifyConfig(resolvedOptions),
    // Apply plugin for generating HTML asset tags through vite-tag snippet
    shopifyHTML(resolvedOptions),
    // React refresh
    shopifyReactRefresh()
  ];
  return plugins;
};
var src_default = vitePluginShopify;
