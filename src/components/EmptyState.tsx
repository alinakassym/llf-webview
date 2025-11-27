import { type FC } from "react";
import { Typography } from "@mui/material";

interface EmptyStateProps {
  message: string;
}

const EmptyState: FC<EmptyStateProps> = ({ message }) => {
  return (
    <Typography
      variant="body1"
      color="text.secondary"
      textAlign="center"
      sx={{ py: 4 }}
    >
      {message}
    </Typography>
  );
};

export default EmptyState;
