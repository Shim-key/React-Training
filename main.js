const version = '19.0.0-rc-14a4699f-20240725';

async function init() {
  const module1 = await import(`https://esm.sh/react@${version}`);
  window.React = module1.default;
  const module2 = await import(`https://esm.sh/react-dom@${version}/client`);
  window.ReactDOMClient = module2.default;
    main();
}

function main() {
  const root = document.getElementById('root');
  const rootElement = ReactDOMClient.createRoot(root);
  const h2 = React.createElement('h2', {}, "Sample application");
  const p = React.createElement('p', {}, "これはReactのサンプルアプリケーションです。");
  const div = React.createElement('p', {}, [h2, p]);
  rootElement.render(div);
}

init();