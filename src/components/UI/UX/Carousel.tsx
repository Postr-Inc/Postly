import { joinClass } from '@/src/Utils/Joinclass';
import { createSignal, createContext, useContext, Show , onMount} from 'solid-js';
import { render } from 'solid-js/web';

// Create a context for the carousel
const CarouselContext = createContext({}) as any;

function CarouselProvider(props: any) {
  const [items, setItems] = createSignal([]) as any;
  const [currentIndex, setCurrentIndex] = createSignal(0);

  const registerItem = (id: any) => { 
    setItems((prevItems: any) => [...prevItems, id]);
  };

  const removeItem = (id: any) => {
    setItems(items().filter((item: any) => item !== id));
  }

  const id = () =>   {
    return Math.random().toString(36).substring(7);
  }

  const nextItem = () => {
     // check if the current index is the last item else go to the next item
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items().length);
  };

  const prevItem = () => { 
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items().length) % items().length);
  };

  return (
    <CarouselContext.Provider  value={{ items, currentIndex, registerItem, nextItem, prevItem , removeItem, setItems, setCurrentIndex, id }} >
      {props.children}
    </CarouselContext.Provider>
  );
}

function Carousel(props:any) {
  return (
    <CarouselProvider>
      <div class={joinClass("carousel focus:outline-none h-full rounded-box w-full", props.class)}>{props.children}</div>
    </CarouselProvider>
  );
}

export function CarouselItem(props: any) {
  let { items, currentIndex, registerItem , removeItem, prevItem, nextItem   } = useContext(CarouselContext) as {items: any, currentIndex: any, registerItem: any, removeItem: any, setItems: any, setCurrentIndex: any, nextItem: any, prevItem: any};
  
 

  onMount(() => {
    //@ts-ignore; 
    registerItem(props.id);
  });

  function handleDelete() {  
    removeItem(props.id);  
    document.getElementById(props.id).remove();
    if(props.hasOwnProperty('onDelete')) {
      props.onDelete();
    }
  }
  

  return (
    <div
      id={props.id}
      onClick={props?.onClick}
      class="carousel-item w-full" 
      style={{ transform: `translateX(-${currentIndex() * 100}%)` , transition: "transform 0.5s" }}
    >
      <Show when={props.showDelete}>
        <span class='absolute top-2 left-2'  onClick={() => handleDelete()}>
          <button class="btn btn-circle btn-ghost" >X</button>  
        </span>
      </Show>
      <Show when={props.fileSizeError}>
        <div class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md">File size too large</div>
      </Show>
      {props.children}
     { items().length > 1 &&   <div class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
        <Show when={currentIndex() !== 0}>
        <button onClick={prevItem} class="btn  opacity-50 bg-base-200 btn-circle">❮</button>
        </Show>
        <button></button>
        <Show when={currentIndex() !== items().length - 1}>
          
        <button onClick={nextItem} class="btn  opacity-50 bg-base-200 btn-circle">❯</button>
        </Show>
      </div>
      }
    </div>
  );
}

Carousel.Item = CarouselItem;

export default Carousel;
