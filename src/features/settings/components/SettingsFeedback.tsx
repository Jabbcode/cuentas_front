import type { FeedbackMessage } from '../types';

export interface SettingsFeedbackProps {
  message: FeedbackMessage;
}

export function SettingsFeedback({ message }: SettingsFeedbackProps) {
  const colorClass =
    message.type === 'success'
      ? 'bg-green-50 text-green-800 border border-green-200'
      : 'bg-red-50 text-red-800 border border-red-200';

  return <div className={`rounded-lg p-4 ${colorClass}`}>{message.text}</div>;
}
