import { faker } from '@faker-js/faker';
import type { TestUser } from '@app-types/user';

export const setSeed = (seed: number): void => {
  faker.seed(seed);
};

export const buildUser = (overrides: Partial<TestUser> = {}): TestUser => {
  const firstName = overrides.firstName ?? faker.person.firstName();
  const lastName = overrides.lastName ?? faker.person.lastName();
  return {
    firstName,
    lastName,
    email:
      overrides.email ?? faker.internet.email({ firstName, lastName, provider: 'example.com' }),
    password: overrides.password ?? `${faker.internet.password({ length: 12 })}!Aa1`,
    phone: overrides.phone ?? faker.phone.number({ style: 'international' }),
    company: overrides.company ?? faker.company.name(),
  };
};

export const buildAddress = () => ({
  street: faker.location.streetAddress(),
  city: faker.location.city(),
  state: faker.location.state(),
  zip: faker.location.zipCode(),
  country: faker.location.country(),
});

export const randomString = (length = 10): string =>
  faker.string.alphanumeric({ length, casing: 'mixed' });

export const randomEmail = (domain = 'example.com'): string =>
  `${faker.internet.username().toLowerCase()}.${Date.now()}@${domain}`;

export { faker };
