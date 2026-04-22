# Pin to the same Playwright version as in package.json to keep browser binaries
# in sync with the test runner.
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /workspace

ENV CI=true \
    HUSKY=0 \
    npm_config_loglevel=warn

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
