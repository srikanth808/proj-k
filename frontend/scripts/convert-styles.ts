import { readFile, writeFile } from 'fs/promises';
import path from 'path';

async function createCssModuleTypes() {
  const content = `declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}`;
  
  await writeFile(path.join('src', 'types', 'css.d.ts'), content);
}

async function convertInlineStylesToModules() {
  // Process each component
  const components = [
    'Results',
    'App',
    'Navigation',
    'Registration',
    'PlayersList'
  ];

  for (const component of components) {
    // Read component file
    const content = await readFile(path.join('src', 'pages', `${component}.tsx`), 'utf-8');
    
    // Extract inline styles
    const styleRegex = /style=\{\{([^}]+)\}\}/g;
    const matches = content.match(styleRegex) || [];
    
    // Convert to CSS module classes
    let cssContent = '';
    let newContent = content;
    
    matches.forEach((match, index) => {
      const className = `style${index}`;
      const styles = match.match(/\{\{([^}]+)\}\}/)[1];
      
      // Convert style object to CSS
      const cssStyles = styles
        .split(',')
        .map(style => style.trim())
        .map(style => {
          const [key, value] = style.split(':').map(s => s.trim());
          return `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value.replace(/'/g, '')};`;
        })
        .join('\n');
        
      cssContent += `.${className} {\n${cssStyles}\n}\n\n`;
      
      // Replace inline style with className
      newContent = newContent.replace(match, `className={styles.${className}}`);
    });
    
    // Add CSS module import
    if (matches.length > 0) {
      newContent = `import styles from './${component}.module.css';\n${newContent}`;
      
      // Write CSS module file
      await writeFile(
        path.join('src', 'pages', `${component}.module.css`),
        cssContent
      );
      
      // Write updated component file
      await writeFile(
        path.join('src', 'pages', `${component}.tsx`),
        newContent
      );
    }
  }
}

async function main() {
  await createCssModuleTypes();
  await convertInlineStylesToModules();
}

main().catch(console.error);