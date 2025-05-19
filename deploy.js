// deploy.js - Deno Deploy configuration helper
export default {
  project: "walletx",
  entrypoint: "jsr:@deno/nextjs-start",
  
  // Define which files are treated as static assets
  static: {
    // List of glob patterns for static assets
    patterns: [
      ".next/static/**/*.+(woff|woff2|eot|ttf|otf)",
      ".next/static/**/*.+(jpg|jpeg|png|gif|ico|svg)",
      "public/**/*"
    ],
    // Exclude certain patterns
    exclude: [
      "node_modules/**/*",
      ".git/**/*"
    ]
  },
  
  // Make sure binary files are properly handled
  binaryMediaTypes: [
    "font/woff",
    "font/woff2", 
    "font/ttf",
    "font/otf",
    "font/eot",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml"
  ]
}; 