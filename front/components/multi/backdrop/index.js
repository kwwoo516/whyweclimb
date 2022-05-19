import CreateModal from "../createModal";
import FindModal from "../findModal";
import JoinModal from "../joinModal";
import SelectModal from "../../modeSelect/selectModal"
import UCC from "../../ucc";
import { motion } from "framer-motion";


export default function Backdrop ({label, handleClose}) {

  return (
    <motion.div
      onClick={handleClose}
      className="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {label === "findModal" && <FindModal handleClose={handleClose} />}
      {label === "joinModal" && <JoinModal handleClose={handleClose} />}
      {label === "createModal" && <CreateModal handleClose={handleClose} />}
      {label === "selectModal" && <SelectModal handleClose={handleClose} />}
      {label === "uccModal" && <UCC handleClose={handleClose} />}
    </motion.div>
  );
};