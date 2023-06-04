import { useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useDispatch } from 'react-redux';

const localizer = momentLocalizer(moment)

const myEventsList = [
    {
        title: "Evento Teste",
        start: moment().toDate(),
        end: moment().add(30, 'minutes').toDate(),
    }
]



const Agendamentos = () => {


    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({
            type: '@agendamentos/FILTER',
            start: moment().weekday(0).format('YYYY-MM-DD'),
            end: moment().weekday(6).format('YYYY-MM-DD'),
        });

    }, [])



    return (
        <div className="col p-5 overflow-auto h-100">
            <div className="row">
                <div className="col-12">
                    <h2 className="mb-4 mt=0">Agendamentos</h2>
                    <Calendar
                        localizer={localizer}
                        events={myEventsList}
                        defaultView="week"
                        selectable
                        popup
                        style={{ height: 500 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Agendamentos;