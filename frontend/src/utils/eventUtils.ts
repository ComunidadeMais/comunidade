import { EventType } from '../types/event';

export const getEventTypeColor = (type: EventType): string => {
  switch (type) {
    case EventType.CULTO:
      return '#4CAF50'; // Verde
    case EventType.SERVICE:
      return '#2196F3'; // Azul
    case EventType.CLASS:
      return '#FF9800'; // Laranja
    case EventType.MEETING:
      return '#9C27B0'; // Roxo
    case EventType.VISIT:
      return '#F44336'; // Vermelho
    case EventType.OTHER:
      return '#757575'; // Cinza
    default:
      return '#757575'; // Cinza para tipos desconhecidos
  }
}; 