// Email Worker: stuurt alle mail voor wabokkio.nl door naar beide (geverifieerde) adressen.
const DESTINATIONS = ['gielsbrouwer@gmail.com', 'giels@akela.ai'];
export default {
  async email(message: ForwardableEmailMessage) {
    const results = await Promise.allSettled(DESTINATIONS.map((to) => message.forward(to)));
    if (results.every((r) => r.status === 'rejected')) message.setReject('Doorsturen mislukt');
  },
};
