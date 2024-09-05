import { isErr } from './M';
import { main } from './main';

try {
  const result = main();
  if (isErr(result)) {
    console.error(result.reason);
  }
} catch (err) {
  console.error(err);
}
