import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';

interface Props {
  icon?: React.ReactNode;
  placeholder: string;
  options: string[];
  /** Single mode: the selected value. Multiple mode: comma-joined selected values. */
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  emptyText?: string;
  textColor?: string;
}

export function DropdownSelect({
  icon,
  placeholder,
  options,
  value,
  onChange,
  multiple = false,
  emptyText,
  textColor = '#fff',
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = new Set(
    multiple
      ? value.split(',').map((s) => s.trim()).filter(Boolean)
      : value
      ? [value]
      : []
  );

  const toggle = (opt: string) => {
    if (multiple) {
      const next = new Set(selected);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      onChange(Array.from(next).join(', '));
    } else {
      onChange(opt);
      setOpen(false);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)} activeOpacity={0.7}>
        {icon}
        <Text style={[styles.fieldText, { color: value ? textColor : '#888' }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <ChevronDown color="#0056FF" size={20} style={styles.chevron} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.header}>
              <Text style={styles.title}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X color="#fff" size={22} />
              </TouchableOpacity>
            </View>

            {options.length === 0 ? (
              <Text style={styles.empty}>
                {emptyText || 'No hay opciones todavía. Agrégalas desde el panel web.'}
              </Text>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item, i) => `${item}-${i}`}
                style={styles.list}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSel = selected.has(item);
                  return (
                    <TouchableOpacity style={styles.option} onPress={() => toggle(item)}>
                      <Text style={[styles.optionText, isSel && styles.optionTextSel]} numberOfLines={1}>
                        {item}
                      </Text>
                      {isSel && <Check color="#0056FF" size={20} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            {multiple && (
              <TouchableOpacity style={styles.doneBtn} onPress={() => setOpen(false)}>
                <Text style={styles.doneText}>Listo</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 86, 255, 0.3)',
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 52,
    overflow: 'hidden',
  },
  fieldText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  chevron: {
    marginRight: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: '#1C1E24',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 86, 255, 0.3)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    maxHeight: 320,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionText: {
    color: '#e5e5e5',
    fontSize: 16,
    flex: 1,
  },
  optionTextSel: {
    color: '#4d8bff',
    fontWeight: '700',
  },
  empty: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 28,
    paddingHorizontal: 18,
  },
  doneBtn: {
    backgroundColor: '#0056FF',
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
