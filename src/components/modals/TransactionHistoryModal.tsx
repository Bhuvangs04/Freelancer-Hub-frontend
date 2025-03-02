import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "release" | "refund" | "commission";
  amount: number;
  date: Date;
  status: "completed" | "pending" | "failed";
  projectTitle: string;
  projectId: string;
}

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const TransactionHistoryModal = ({
  isOpen,
  onClose,
  transactions,
}: TransactionHistoryModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-center underline">
            Transaction History
          </DialogTitle>
          <p className="ml-3 mt-3 text-sm text-blue-500">
            Any Transaction related issues? Contact us at{" "}
            <a
              href="mailto:freelancer.hub.nextgen@gmail.com"
              className="underline"
            >
              Mail
            </a>
          </p>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">{transaction.type}</p>
                  <p className="text-sm text-gray-500">
                    Project_ID: {transaction.projectId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Project: {transaction.projectTitle}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(transaction.date, "PPP")}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      transaction.type === "deposit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "deposit" ? "+" : "-"}₹
                    {transaction.amount.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm ${
                      transaction.status === "completed"
                        ? "text-green-600"
                        : transaction.status === "failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-sm text-center text-gray-500 mt-2">
          Sometimes it takes upto 1-2 hrs to update here.Don't worry if you
          don't find your transaction. Your money is safe with our company.
        </p>
      </DialogContent>
    </Dialog>
  );
};
