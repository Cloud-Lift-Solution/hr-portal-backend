export const FILE_VALIDATORS = {
  PROFILE_IMAGE: {
    // TODO
    maxSize: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    allowedExtensions: ['jpg', 'jpeg', 'png'],
  },
  GENERAL_FILE: {
    maxSize: 10 * 1024 * 1024,
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
  },
};
