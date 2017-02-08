import {permutations} from '../permutations';
import {StateTransition} from '../transition';
import {VariantWithTransformer} from '../variant';

describe('variant permutations', () => {
  it('should return all permutations of variant options', () => {
    type AppVariants = {language: string, production: boolean, anonymous: boolean};

    const combinations = permutations<AppVariants>({
      language: {
        useFunction: (moduleRef, language: string) => {},
        values: ['en-US', 'en-CA', 'fr-FR'],
      },
      production: {
        useFunction: (moduleRef, prod: boolean) => {},
        values: [true, false]
      },
      anonymous: {
        useFunction: (moduleRef, anonymous: boolean) => {},
        values: [true, false]
      }
    });

    expect(combinations.length).toBe(12);
    expect(combinations.filter(s => s.variant.production === true).length).toBe(6);
    expect(combinations.filter(s => s.variant.language === 'en-US').length).toBe(4);
    expect(combinations.filter(s => s.variant.language === 'en-CA').length).toBe(4);
    expect(combinations.filter(s => s.variant.language === 'fr-FR').length).toBe(4);
  });

  it('aggregates variant transitions into one transition function', done => {
    type AppVariants = {production: boolean, anonymous: boolean};

    const combinations = permutations<AppVariants>({
      production: {
        useFunction: (injector: any, prod: boolean) => {injector.prod = prod},
        values: [true, false]
      },
      anonymous: {
        useFunction: (injector: any, anon: boolean) => {injector.anon = anon},
        values: [true, false]
      }
    });

    const promises =
      combinations.map(c => {
        const obj = {} as any;

        c.transition(obj)
          .then(() => {
              expect(obj.anon).toBe(c.variant.anonymous);
              expect(obj.prod).toBe(c.variant.production);
          });
      });

    Promise.all(promises).then(done);
  });
});