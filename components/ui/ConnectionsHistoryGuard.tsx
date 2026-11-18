export const connectionsRegionId = "connections-sensitive";

// Register during document parsing so a history traversal before hydration is
// covered too. This static script contains no session or contact data.
const guard = `
(() => {
  let reloading = false;
  function hideConnections() {
    const region = document.getElementById(${JSON.stringify(connectionsRegionId)});
    if (region) region.hidden = true;
  }
  window.addEventListener("pagehide", hideConnections);
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted || reloading) return;
    reloading = true;
    hideConnections();
    window.location.reload();
  });
})();
`;

export default function ConnectionsHistoryGuard() {
  return <script dangerouslySetInnerHTML={{ __html: guard }} />;
}
