import * as Mustache from "mustache";
import * as fs from "fs";
import * as path from "path";

export function side2puppeteer(filePath: string): string[] {
  let content = fs.readFileSync(filePath, 'utf-8');
  let json = JSON.parse(content);

  const result: string[] = [];
  for (const test of json.tests) {
    let commands: string[] = [];
    for (const commandInfo of test.commands) {
      let {command, targets, target, value} = commandInfo;
      let templatePath = path.join(__dirname, '../template', `${command}.mustache`);

      switch (command) {
        case 'open':
          let lines = Mustache.render(fs.readFileSync(templatePath, 'utf-8'), {
            target,
          });
          commands = commands.concat(lines.split('\n'));
          break;
        case 'type': {
          let selector = getCSSSelector(targets);
          let lines = Mustache.render(fs.readFileSync(templatePath, 'utf-8'), {
            selector,
            value,
          });
          commands = commands.concat(lines.split('\n'));
          break;
        }
        case 'click': {
          let selector = getCSSSelector(targets);
          let lines = Mustache.render(fs.readFileSync(templatePath, 'utf-8'), {
            selector,
          });
          commands = commands.concat(lines.split('\n'));
          break;
        }
        default:
          console.warn(`ignoring command: ${command}`);
      }
    }
    result.push(Mustache.render(fs.readFileSync(path.join(__dirname, '../template', `template.mustache`), 'utf-8'), {
      commands: commands.map(it => `  ${it}`),
    }));
  }
  return result;
}

function getCSSSelector(targets: string[][]) {
  return targets
    .find(it => {
      return it[0].startsWith('css=');
    })![0]
    .substring(4);
}
