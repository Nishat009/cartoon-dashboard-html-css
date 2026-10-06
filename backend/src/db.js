import dns from "node:dns";
import mongoose from "mongoose";

export function connectDatabase() {
  // Some Windows setups give Node a local DNS server that rejects the SRV
  // lookups mongodb+srv:// URIs need; DNS_SERVERS overrides it.
  const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);
  if (dnsServers?.length) dns.setServers(dnsServers);
  return mongoose.connect(process.env.MONGODB_URI);
}
