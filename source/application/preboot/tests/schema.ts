import {PrebootConfiguration} from '../contract';

import {validatePrebootOptionsAgainstSchema} from './../schema';

describe('Preboot schema validator', () => {
  it('can validate a comprehensive preboot configuration', () => {
    const config: PrebootConfiguration = {
      appRoot: 'application',
      eventSelectors: [
        {selector: 'input,textarea', events: ['keypress', 'keyup', 'keydown', 'input', 'change']},
        {selector: 'select,option', events: ['change']},
        {selector: 'input', events: ['keyup'], preventDefault: true, keyCodes: [13], freeze: true},
        {selector: 'input,textarea', events: ['focusin', 'focusout', 'mousedown', 'mouseup'], noReplay: true},
        {selector: 'input[type="submit"],button', events: ['click'], preventDefault: true, freeze: true}
      ],
      buffer: true,
      uglify: true,
      noInlineCache: true
    };
    const validated = validatePrebootOptionsAgainstSchema(config);
    expect(validated).not.toBeNull();
    expect(validated.valid).toBeTruthy();
    expect(validated.errors.length).toBe(0);
  });

  it('fails when configuration is missing both appRoot and serverClientRoot', () => {
    const config = {appRoot: null, serverClientRoot: null};
    const validated = validatePrebootOptionsAgainstSchema(config);
    expect(validated).not.toBeNull();
    expect(validated.valid).toBeFalsy();
    expect(validated.errors.length).toBeGreaterThan(0);
  });

  it('fails when both appRoot and serverClientRoot are specified', () => {
    const config = {appRoot: 'application1', serverClientRoot: {server: 'application2', client: 'application1'}};
    const validated = validatePrebootOptionsAgainstSchema(config);
    expect(validated).not.toBeNull();
    expect(validated.valid).toBeFalsy();
    expect(validated.errors.length).toBeGreaterThan(0);
  });
});