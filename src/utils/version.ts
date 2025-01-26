async function getVersions(packageName: string): Promise<string[]> {
   try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      if (!response.ok) {
         throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      const data = (await response.json()) as { versions: Record<string, any> };
      return Object.keys(data.versions).sort((a, b) =>
         b.localeCompare(a, undefined, { numeric: true })
      );
   } catch (error) {
      throw new Error(`Failed to fetch versions for ${packageName}: ${error.message}`);
   }
}

function parseMinecraftVersions(version: string): { npm: string; mc: string } {
   const match = version.match(/(\d+\.\d+\.\d+)-beta\.(.*?)-stable/);
   if (match) {
      return { npm: match[1], mc: match[2] };
   }
   throw new Error(`Invalid version format: "${version}"`);
}

async function getMinecraftVersions() {
   const [serverVersions, uiVersions] = await Promise.all([
      getVersions("@minecraft/server"),
      getVersions("@minecraft/server-ui"),
   ]);

   const groupedVersions: Record<string, { "@minecraft/server": string; "@minecraft/server-ui": string }> = {};

   [serverVersions, uiVersions].forEach((versions, index) => {
      const key = index === 0 ? "@minecraft/server" : "@minecraft/server-ui";
      versions
         .filter((v) => v.endsWith("-stable"))
         .forEach((v) => {
            const { npm, mc } = parseMinecraftVersions(v);
            if (!groupedVersions[mc]) groupedVersions[mc] = { "@minecraft/server": "", "@minecraft/server-ui": "" };
            groupedVersions[mc][key] = v;
         });
   });

   return groupedVersions;
}

export { getVersions, parseMinecraftVersions, getMinecraftVersions }