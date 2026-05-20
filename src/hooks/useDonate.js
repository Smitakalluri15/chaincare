import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  UGFClient,
  UGFError,
  TYI_USD_PAYMENT_COIN,
} from "@tychilabs/ugf-testnet-js";
import { useContracts } from "./useContracts";
import { useWallet } from "../context/useWallet";

// 4 steps shown in the UI stepper
export const STEPS = [
  { id: 1, label: "Quoting" },
  { id: 2, label: "Authorizing TYI" },
  { id: 3, label: "Executing via UGF" },
  { id: 4, label: "Done" },
];

export function useDonate({ onSuccess }) {
    const { account, signer, isCorrectNetwork, chainId } = useWallet();
    const { donationAddress } = useContracts();
    const [activeStep, setActiveStep] = useState(0); // 0 = idle
    const [donatingId, setDonatingId] = useState(null); // which NGO
    const [lastDonation, setLastDonation] = useState(null);

    const donate = async (ngoName, amountTYI, ngoId) => {
      if (!account) {
        toast.error("Connect your wallet first!");
        return;
      }
      if (!isCorrectNetwork) {
        toast.error(`Wrong network! MetaMask is on chainId: ${chainId}, expected 84532.`);
        return;
      }
    if (!signer) {
      toast.error("Wallet signer not ready.");
      return;
    }
    if (!donationAddress) {
      toast.error("Donation contract address is missing.");
      return;
    }

    setDonatingId(ngoId);
    setLastDonation(null);

    try {
      const amountWei = ethers.parseEther(amountTYI.toString());
      const donationInterface = new ethers.Interface([
        "function donateToNGO(string ngoName, uint256 amount) external",
      ]);
      const txData = donationInterface.encodeFunctionData("donateToNGO", [
        ngoName,
        amountWei,
      ]);
      const client = new UGFClient();

      await client.auth.login(signer);

      // Step 1: Quote the remote transaction
      setActiveStep(1);
      const quote = await client.quote.get({
        payer_address: account,
        tx_object: JSON.stringify({
          from: account,
          to: donationAddress,
          data: txData,
          value: "0",
        }),
      });

      // Step 2: Authorize TYI_MOCK_USD settlement via UGF
      setActiveStep(2);
      await client.payment.x402.execute({
        quote,
        signer,
        token: TYI_USD_PAYMENT_COIN,
      });

      // Step 3: UGF sponsors and executes the donation tx
      setActiveStep(3);
      
      // Patch for MetaMask Base Sepolia getFeeData bug
      const originalGetFeeData = signer.provider.getFeeData.bind(signer.provider);
      signer.provider.getFeeData = async () => {
        try {
          return await originalGetFeeData();
        } catch (err) {
          const gasPrice = await signer.provider.send("eth_gasPrice", []);
          return {
            gasPrice: BigInt(gasPrice),
            maxFeePerGas: null,
            maxPriorityFeePerGas: null
          };
        }
      };

      const { userTxHash } = await client.chains.evm.sponsorAndExecute(
        quote.digest,
        signer,
        async () => ({
          to: donationAddress,
          data: txData,
          value: 0n,
        }),
      );

      setActiveStep(4);
      const result = {
        ngoName,
        amountTYI,
        txHash: userTxHash,
        quoteAmount: quote.payment_amount,
      };
      setLastDonation(result);

      toast.success("Donation completed gaslessly via UGF.");
      onSuccess?.();
    } catch (err) {
      console.error(err);

      if (err?.code === 4001) {
        toast.error("Transaction rejected.");
      } else if (err instanceof UGFError) {
        toast.error(`UGF ${formatStageError(err)}`);
      } else {
        toast.error("Donation failed. Check console.");
      }
    } finally {
      window.setTimeout(() => {
        setActiveStep(0);
        setDonatingId(null);
      }, 1800);
    }
  };

  return { donate, activeStep, donatingId, lastDonation, STEPS };
}

function formatStageError(err) {
  const message = err?.message ?? "flow failed.";
  return message.charAt(0).toLowerCase() + message.slice(1);
}
