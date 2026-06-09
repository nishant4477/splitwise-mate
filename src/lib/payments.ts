export interface PaymentUserDetails {
  name?: string | null;
  upiId?: string | null;
  venmoUsername?: string | null;
  paypalUsername?: string | null;
  cashappTag?: string | null;
}

export function generatePaymentLinks(
  user: PaymentUserDetails,
  amount: number,
  currency: string,
  note: string = "SplitMate Settlement"
) {
  const links: Record<string, string> = {};

  const encodedNote = encodeURIComponent(note);

  if (user.upiId) {
    // upi://pay?pa={upi_id}&pn={name}&am={amount}&cu=INR&tn={note}
    const name = encodeURIComponent(user.name || "SplitMate User");
    links.upi = `upi://pay?pa=${user.upiId}&pn=${name}&am=${amount}&cu=${currency}&tn=${encodedNote}`;
  }

  if (user.venmoUsername) {
    // https://venmo.com/?txn=pay&audience=private&recipients={username}&amount={amount}&note={note}
    // Remove @ if they included it
    const cleanUsername = user.venmoUsername.replace("@", "");
    links.venmo = `https://venmo.com/?txn=pay&audience=private&recipients=${cleanUsername}&amount=${amount}&note=${encodedNote}`;
  }

  if (user.paypalUsername) {
    // https://paypal.me/{username}/{amount}
    const cleanUsername = user.paypalUsername.replace("@", "");
    links.paypal = `https://paypal.me/${cleanUsername}/${amount}`;
  }

  if (user.cashappTag) {
    // https://cash.app/${username}/{amount}
    // Cash app tags usually start with $
    const cleanTag = user.cashappTag.startsWith("$")
      ? user.cashappTag
      : `$${user.cashappTag}`;
    links.cashapp = `https://cash.app/${cleanTag}/${amount}`;
  }

  return links;
}
