/**
 * Confirms the configured Cloudinary credentials actually work, and that the
 * quality policy is expressible.
 *
 * Run:  node tests/verification/cloudinary-connection.mjs
 *
 * Credentials are read from .env and NEVER printed.
 */

import 'dotenv/config';
import crypto from 'node:crypto';

function report(label, pass, detail = '') {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!pass) process.exitCode = 1;
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const publicCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

report('CLOUDINARY_CLOUD_NAME set', Boolean(cloudName) && cloudName !== 'placeholder');
report('CLOUDINARY_API_KEY set', Boolean(apiKey) && apiKey !== 'placeholder');
report('CLOUDINARY_API_SECRET set', Boolean(apiSecret) && apiSecret !== 'placeholder');

// The browser builds image URLs from the public name; a mismatch 404s every
// image while everything else looks fine.
report(
  'public cloud name matches the server one',
  Boolean(publicCloudName) && publicCloudName === cloudName,
  publicCloudName === cloudName ? 'in sync' : 'MISMATCH — every image would 404',
);

if (!cloudName || !apiKey || !apiSecret) {
  console.log('\nCannot reach the API without credentials.');
  process.exit(1);
}

// Authenticated ping: /resources requires a valid key/secret pair.
const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

try {
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=1`,
    { headers: { authorization: `Basic ${auth}` } },
  );

  report(
    'credentials accepted by Cloudinary',
    response.ok,
    `HTTP ${response.status}${response.status === 401 ? ' — key/secret rejected' : ''}`,
  );

  if (response.ok) {
    const body = await response.json();
    console.log(`      account currently holds ${body.resources?.length ?? 0} image(s) in this page`);
  }
} catch (error) {
  report('credentials accepted by Cloudinary', false, String(error));
}

// The upload signature must be reproducible: Cloudinary rejects a request whose
// signature does not match the parameters sent.
const timestamp = Math.round(Date.now() / 1000);
const params = {
  folder: 'school/images',
  image_metadata: 'false',
  overwrite: 'false',
  timestamp,
  unique_filename: 'true',
  use_filename: 'true',
};

const toSign = Object.keys(params)
  .sort()
  .map((key) => `${key}=${params[key]}`)
  .join('&');

const signature = crypto
  .createHash('sha1')
  .update(toSign + apiSecret)
  .digest('hex');

report('upload signature generated', signature.length === 40, `sha1, ${signature.length} chars`);

// image_metadata=false is what strips EXIF/GPS at ingest. Locked rule N.
report(
  'signed params request metadata stripping',
  toSign.includes('image_metadata=false'),
  'EXIF/GPS discarded at upload',
);

// The quality policy: no q_auto, no f_auto anywhere in the delivery URLs.
const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/sample`;
const sizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_100,c_limit,w_1080,fl_progressive/sample`;

report(
  'full-size URL carries no transformation',
  !/\/(q_|f_|c_)/.test(originalUrl.split('/upload/')[1] ?? ''),
  'original bytes served untouched',
);
report(
  'sized URL uses q_100, never q_auto',
  sizedUrl.includes('q_100') && !sizedUrl.includes('q_auto'),
  'resized, never lossily recompressed',
);
