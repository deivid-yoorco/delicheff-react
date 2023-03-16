import { format } from 'date-fns';
import locale from 'date-fns/locale/es';

export const getShippingFormatedDate = (date: Date) => {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return format(new Date(date), (tomorrow.getDate() === new Date(date).getDate() ? "'mañana'" : "EEEE") + ", dd 'de' LLLL", { locale });
};