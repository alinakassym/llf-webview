// llf-webview/src/components/CreateCupGroupModal.tsx

import { type FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CreateCupGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCupGroupData) => Promise<void>;
  editingGroup?: { id: number; name: string } | null;
}

export interface CreateCupGroupData {
  name: string;
}

const CreateCupGroupModal: FC<CreateCupGroupModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingGroup = null,
}) => {
  const isEditMode = !!editingGroup;

  const [formData, setFormData] = useState<CreateCupGroupData>({
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateCupGroupData, string>>
  >({});

  // Инициализируем данные при открытии модалки
  useEffect(() => {
    if (open) {
      if (editingGroup) {
        // Режим редактирования - используем данные группы
        setFormData({
          name: editingGroup.name,
        });
      } else {
        // Режим создания - сбрасываем на дефолтные значения
        setFormData({
          name: "",
        });
      }
    }
  }, [open, editingGroup]);

  const handleChange =
    (field: keyof CreateCupGroupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

      // Очищаем ошибку при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateCupGroupData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        {isEditMode ? "Редактировать группу" : "Создать группу"}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Название группы"
            fullWidth
            value={formData.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            required
            autoFocus
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading
            ? isEditMode
              ? "Сохранение..."
              : "Создание..."
            : isEditMode
              ? "Сохранить"
              : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCupGroupModal;
