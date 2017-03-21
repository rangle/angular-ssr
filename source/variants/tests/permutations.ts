import {permutations} from '../permutations';

describe('variant permutations', () => {
  it('should return all permutations of variant options', () => {
    type AppVariants = {language: string, production: boolean, anonymous: boolean};

    const combinations = permutations<AppVariants>({
      language: {
        transition: (moduleRef, language: string) => {},
        values: ['en-US', 'en-CA', 'fr-FR'],
      },
      production: {
        transition: (moduleRef, prod: boolean) => {},
        values: [true, false]
      },
      anonymous: {
        transition: (moduleRef, anonymous: boolean) => {},
        values: [true, false]
      }
    });

    expect(combinations.size).toBe(12);

    const keys = Array.from(combinations.keys());

    expect(keys.filter(s => s.production === true).length).toBe(6);
    expect(keys.filter(s => s.language === 'en-US').length).toBe(4);
    expect(keys.filter(s => s.language === 'en-CA').length).toBe(4);
    expect(keys.filter(s => s.language === 'fr-FR').length).toBe(4);
  });

  it('aggregates variant transitions into one transition function', () => {
    type AppVariants = {production: boolean, anonymous: boolean};

    const combinations = permutations<AppVariants>({
      production: {
        transition: (injector: any, prod: boolean) => {injector.prod = prod},
        values: [true, false]
      },
      anonymous: {
        transition: (injector: any, anon: boolean) => {injector.anon = anon},
        values: [true, false]
      }
    });

    const pairs = Array.from(combinations.entries());

    for (const [variant, transition] of pairs) {
      const obj: {[index: string]: boolean} = {};

      transition(<any> obj);
      expect(obj['anon']).toBe(variant.anonymous);
      expect(obj['prod']).toBe(variant.production);
    }
  });
});