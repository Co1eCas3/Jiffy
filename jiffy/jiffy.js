
(function(win) {

// ----CONSTRUCTOR

  const JiffySlider = function(inpObj) {
    this.slides = Array.isArray(inpObj.slides) ? inpObj.slides : Array.from(inpObj.slides);
    this.controls = Array.isArray(inpObj.controls) ? inpObj.controls : Array.from(inpObj.controls);
    this.locaters = !inpObj.locaters ? this.controls : Array.isArray(inpObj.locaters) ? inpObj.locaters : Array.from(inpObj.locaters);

    this.type = inpObj.type;
    this.anim = inpObj.anim_type;

    this.auto = inpObj.auto;

    this.curSlide_select = filterCList(this.slides.map(slide => slide.classList), this.slides);
    this.curLocate_select = filterCList(this.locaters.map(locater => locater.classList), this.locaters);
  };

// ----INTERNAL VARS

  let phaseC_handle,
      autoSlide;
  const proto = JiffySlider.prototype,
        sliderProps = {},
        phaseB_handle = event => animPhaseB(event, sliderProps);

// grab class name(s) referring to
// currently-displaying slide
// NOTE: user created class must contain '-jifC'
//    @params arr {list of all classes}
//    @params els {user-selected slides/locaters(controls)}

  function filterCList(arr, els) {
    let cName;
    
    arr.forEach(findCName.bind(els));

    function findCName(elCList, i){
      if(elCList.value.includes('-jifC')) {
        cName = Array.from(this[i].classList).find(
            name => name.includes('-jifC')
          );
      }
    }
    return cName;
  }

// ----SETUP:
//    1. write transition properties to Jiffy stylesheet
//    2. apply trans_props to slides
//    3. determine animation type and write @keyframes rules to Jiffy stylesheet
//    4. kick in automatic slide if desired
//    5. intialize click listeners on user-defined list of controls

  proto.init = function() {

    if(!jif(anims.trans_props).findRule()) jif(anims.trans_props).addRule();

    this.slides.forEach(
      slide => slide.classList.add(jif(anims.trans_props).rSel())
    );

    let animProps = animHub(this.anim);
    if(animProps.length > 1) {
      animProps.forEach((rule, i, props) => {
        if(!jif(props[i]).findRule()) jif(props[i]).addRule();
      });
    } else {
      if(!jif(animProps[0]).findRule()) jif(animProps[0]).addRule();
    }

    if(this.auto) {
      autoSlide = setInterval(typeHub.bind(this), 5000);
    }

    this.clicks();
  }

  proto.clicks = function() {
    for(let control in this.controls) {
      this.controls[control].addEventListener('click', typeHub.bind(this));
    }
  }

// ----DETERMINE DESIRED ANIMATION TYPE AND RETURN ASSOCIATED @KEYFRAMES RULES
//    NOTE: if animation is directional in nature,
//    two or more rules are required
//    @params type {user-selected animation style}

  function animHub(type) {
    let u_anim;

    for(let anim in anims) {
      if(anims[anim].name === type) u_anim = anims[anim];
    }

    let props = [];

    if(u_anim.hasDir) {
      for(let rule in u_anim.rules) {
        props.push(u_anim.rules[rule]);
      }
      return props;
    } 
    
    props.push(u_anim.rule);
    return props;

  }

// ----INTIALIZE ANIMATION (ONCLICK/AUTO)
//    1. determine if auto-slide is being overridden
//    2. turn off click listeners to prevent simultaneous animations
//    3. define object to be passed through animation phases
//      a. grab @keyframes selectors and apply to animation object
//      b. determine current location using 'filterCList' function (i.e. '-jifC')
//      c. determine next slide/location (dependant on user-defined slider type)
//        NOTE: inherently 'looped' if called via auto-slide
//    4. apply animationend listeners and begin animation phase

  function typeHub(e) {
    if(this.auto && e) {
      clearInterval(autoSlide);
    }

    for(let control in this.controls) {
      this.controls[control].removeEventListener('click', typeHub.bind(this));
    }

    let animProps = animHub(this.anim);
    sliderProps.anim = {};
    if(animProps.length > 1) {
      sliderProps.anim.out = {};
      sliderProps.anim.inn = {};
      animProps.forEach((rule, i, props) => {

        if(jif(props[i]).rSel().includes('left')) {
          sliderProps.anim.out.left = `animation-name: ${jif(props[i]).rSel()};`;
          sliderProps.anim.inn.left = sliderProps.anim.out.left + ' animation-direction: reverse;';
        } else {
          sliderProps.anim.out.right = `animation-name: ${jif(props[i]).rSel()};`;
          sliderProps.anim.inn.right = sliderProps.anim.out.right + ' animation-direction: reverse;';
        }
      });
    } else {
      sliderProps.anim.out = `animation-name: ${jif(animProps[0]).rSel()};`;
      sliderProps.anim.inn = sliderProps.anim.out + ' animation-direction: reverse;';
    }

    phaseC_handle = event => animPhaseC(event, sliderProps, this.clicks);

    let cur_index = () => {
          for(let slide of this.slides) {
            if(slide.className.includes(this.curSlide_select)) {
              return this.slides.indexOf(slide);
            };
          }
        }

    sliderProps.slideFrom = this.slides[cur_index()];
    sliderProps.locaterFrom = this.locaters[cur_index()];
    sliderProps.curSlide_select = this.curSlide_select;
    sliderProps.curLocate_select = this.curLocate_select;

    const checkDir = () => typeof sliderProps.anim.out === 'object' ? true : false;
    
    switch(this.type) {
      case 'looped':
        if(!e) {
          setAuto(this.slides, this.locaters);
        } else {
          if(e.target.className.includes('left')) {
          
            if(cur_index() === 0) {
              sliderProps.slideTo = this.slides[this.slides.length - 1];
              sliderProps.locaterTo = this.locaters[this.locaters.length - 1];
            } else {
              sliderProps.slideTo = this.slides[cur_index() - 1];
              sliderProps.locaterTo = this.locaters[cur_index() - 1];
            }
            
            if(checkDir()) sliderProps.dir = 'left';

          } else {
            setAuto(this.slides, this.locaters);
          }
        }

        break;
      case 'tabbed':
        if(!e) {
          setAuto(this.slides, this.locaters);
        } else {
          const to_index = this.locaters.indexOf(e.target);

          sliderProps.slideTo = this.slides[to_index];
          sliderProps.locaterTo = this.locaters[to_index];

          if(checkDir()) {
            if(cur_index() < to_index) {
              sliderProps.dir = 'right';
            } else {
              sliderProps.dir = 'left';
            }
          }
        }

        break;
      default:
        console.error('Something\'s wrong with type');
        break;
    }

    function setAuto(slides, locaters) {
      if(cur_index() === slides.length - 1) {
        sliderProps.slideTo = slides[0];
        sliderProps.locaterTo = locaters[0];
      } else {
        sliderProps.slideTo = slides[cur_index() + 1];
        sliderProps.locaterTo = locaters[cur_index() + 1];
      }
      
      if(checkDir()) sliderProps.dir = 'right';
    }

    sliderProps.slideFrom.addEventListener('animationend', phaseB_handle);
    sliderProps.slideTo.addEventListener('animationend', phaseC_handle);

    animPhaseA(sliderProps);
  }

// ----ANIMATION PHASE A
//    apply animation-name to currently-displaying slide/locater,
//    thusly kicking in first animation

  function animPhaseA(props) {
    if(props.dir) {
      if(props.dir === 'left') {
        props.slideFrom.style = props.anim.out.right;
      } else {
        props.slideFrom.style = props.anim.out.left;
      }
    } else {
      props.slideFrom.style = props.anim.out;
    }
  }

// ----ANIMATION PHASE B
//    1. remove 'current' class and animation styling from previously-displayed slide/locater
//    2. remove animationend listener from previous slide
//    3. transfer 'current' class to next-displayed slide/locater
//    4. apply animation style attr to next-displayed slide

  function animPhaseB(e, props) {
    props.slideFrom.classList.remove(props.curSlide_select);
    props.slideFrom.removeAttribute('style');
    props.slideFrom.removeEventListener('animationend', phaseB_handle);
    props.locaterFrom.classList.remove(props.curLocate_select);

    props.locaterTo.classList.add(props.curLocate_select);
    props.slideTo.classList.add(props.curSlide_select);

    if(props.dir) {
      if(props.dir === 'left') {
        props.slideTo.style = props.anim.inn.left;
      } else {
        props.slideTo.style = props.anim.inn.right;
      }
    } else {
      props.slideTo.style = props.anim.inn;
    }
  }

// ----ANIMATION PHASE C
//    remove animation style and listener from next slide
//    re-enable click listeners

  function animPhaseC(e, props, clicks) {
    props.slideTo.removeAttribute('style');
    props.slideTo.removeEventListener('animationend', phaseC_handle);
    clicks();
  }

  win.JiffySlider = JiffySlider;

})(window);