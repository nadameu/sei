import { Err } from './Err';
import { main } from './main';

try {
  const result = main();
  if (result instanceof Err) {
    console.error(result);
  }
} catch (err) {
  console.error(err);
}
