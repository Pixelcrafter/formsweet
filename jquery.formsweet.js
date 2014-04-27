/***

	TODO:
	[ ] - multiple select
	[x] - optgroups

	[ ] - checkboxes
	[ ] - radios

	[ ] - keyboard accessibility

***/
(function($) {
	$.fn.formsweet = function (options) {
		var opt = $.extend({
			mode				: 'standard',
			styleselect			: true,
			selectelementclass	: '',
			selectcloseevent	: 'click', //mouseleave
			styleradio			: true,
			stylecheckbox		: true,
		}, options);

		var eventStartWindowYPos;
		var form = $(this);
		var selidcounter = 0; // select id counter

		$.fn.formsweet.buildselect = function (obj) {
			/***
				- Attribute "size" will be ignored
				- Select elements with attribute "multiple" will not be styled
			***/

			var clickedselid;
			var oldselid;

//			$(obj).find('select').each(function() {
			var createFrmswtSelectElement = function (o) {
//				console.log('createFrmswtSelectElement');
//				console.log($(o));
//				return;
				// check if it is not already a formsweet select element an not a multiple select
				// otherwise create it:
				if(!$(o).parent().hasClass('frmswtselect') && !$(o).attr('multiple')) {
					var el = $(o);
					selidcounter = selidcounter + 1;
					var elwrapperid = 'frmswtselect' + selidcounter;
					// wrap select element
					$(el).wrap('<div id="'+elwrapperid+'" class="frmswtselect"></div>');
					// visually hide original select element
//					$(el).css({'position':'absolute', 'left': '-3000px'});
					// get selected option from original element
					var initval = $(el).find('option:selected').text();
					// append new selector code
					$(createSelectWrapper(initval)).insertAfter(el);

					$(el).children().each(function () {
						if($(this).is("optgroup")) {
							groupname = $(this).attr('label');
							$('#' + elwrapperid + ' ul').append('<li class="frmswtoptgroup">' + groupname + '</li>');
							$(this).find('option').each(function () {
								$('#' + elwrapperid + ' ul').append(createOptionLi(this,elwrapperid,true));
							});
						} else {
							$('#' + elwrapperid + ' ul').append(createOptionLi(this,elwrapperid,false));
						}
					});
				}
			}
//			});

			if ($(obj).is('select')) {
//					console.log('Single Element');
					createFrmswtSelectElement($(obj));
			} else {
				$(obj).find('select').each(function() {
//					console.log('Init');
//					console.log($(this));
					createFrmswtSelectElement($(this));
				});
			}

			$('.frmswtselectedelement').click(function(event) {
				event.stopPropagation();
				clickedselid = getFrmswtSelectId(this);
				// At first close any previously opened frmswtselect element 
				if (oldselid && (clickedselid != oldselid)) {
					hideSelectDropDown($('#'+oldselid+' .frmswtselectdropdown'));
				}
				showSelectDropDown($('#'+clickedselid).find('.frmswtselectdropdown'));
				oldselid = clickedselid;
			});

			$('.frmswtselectdropdown li').not('.frmswtoptgroup').click(function() {
				// var eid = $(this).closest('.frmswtselect').attr('id');
				var elid = getFrmswtSelectId(this);
				// set selected value of original select element
				$('#'+elid+' select').val($(this).attr('data-value')).change();
				// set select info on new formsweet select element
				$('#'+elid+' span.frmswtselectedelementvalue').html($(this).text());
				// remove old selected marker and set new selected marker
				$('#'+elid+' li.selected').removeClass('selected');
				$(this).addClass('selected');
				// hide the drop-down
				hideSelectDropDown($('#'+elid+' .frmswtselectdropdown'));
			});

			$('.frmswtselect select').change(function() {
				var elid = getFrmswtSelectId(this);
				// set selected value of original select element
				var st = $(this).find('option:selected').text();
				var val = $(this).find('option:selected').val();
				// set select info on new formsweet select element
				$('#'+elid+' span.frmswtselectedelementvalue').html(st);
				$('#'+elid+' li.selected').removeClass('selected');
				$('#'+elid+' li[data-value='+val+']').addClass('selected');
			});

		}

		var createSelectWrapper = function (initval) {
			return '<div class="frmswtselectedelement"><span class="frmswtselectedelementvalue">'+initval+'</span><span class="frmswtselectboxicon">&nbsp;</span></div><ul class="frmswtselectdropdown"></ul>';
		}

		var createOptionLi = function (el,wrapperid,inoptgroup) {
			var ttc = $(el).attr('title') ? ' title="'+$(el).attr('title')+'"' : '';
			var optgroupcl = inoptgroup ? ' frmswtinoptgroup' : '';
			return '<li class="frmswtoption' + optgroupcl + ' ' + opt.selectelementclass + '" data-value="'+ $(el).val() +'"' + ttc + '>' + $(el).text() + '</li>';
		}

		var showSelectDropDown = function (el,selid,oldselid) {
			// get window position to reset after scrolling the options list
			eventStartWindowYPos = $(window).scrollTop();

			if (opt.selectcloseevent == 'mouseleave') {
				$(el).mouseleave(function () {
					hideSelectDropDown(el);
				});
			} else {
				$(document).on('click', function(e) {
					if (!(e.target.className == 'frmswtoptgroup')) {
						hideSelectDropDown(el);
					} else {
						
					}
				});
			}

			$(el).fadeIn(100);

		}

		var hideSelectDropDown = function (el) {

			$(el).fadeOut(100);

			var eloffset = el.offset();
			var winscroll = $(window).scrollTop();
			if((eloffset.top < winscroll) && (eventStartWindowYPos < winscroll)) {
				$('html,body').animate({scrollTop: eventStartWindowYPos},'fast');
			}
			$(document).off('click');
		}

		var getFrmswtSelectId = function (el) {
			var elid = $(el).closest('.frmswtselect').attr('id');
			return elid;
		}



//		var buildcheckbox = function (f) {
		$.fn.formsweet.buildcheckbox = function (obj) {

			var cbxidcounter = 0; // checkbox id counter

			$(obj).find('input[type=checkbox]').each(function() {

				cbxidcounter = cbxidcounter + 1;
				var el = $(this);
				var cbxid = el.attr('id');
				var cbxstateclass = '';
				var elwrapperid = 'frmswtcheckbox' + cbxidcounter;
//				console.log(el.attr('id'));
				var label = obj.find('label[for='+el.attr('id')+']');
				var altlabel;
				if (label.length == 0) {
					altlabel = el.next('label');
					if (altlabel.length == 0) {
						altlabel = el.prev('label');
					}
				}
				if (altlabel && !($(altlabel).attr('for'))) {
					label = altlabel;
				}
				if($('#'+cbxid).attr('checked')) {
					cbxstateclass = ' frmswtcheckboxon';
				}
				$(label).wrap('<div id="'+elwrapperid+'" class="frmswtcheckbox"></div>');
				$(el).prependTo('#'+elwrapperid+' label');
				$('<span class="frmswtcheckboxicon'+cbxstateclass+'">&nbsp;</span>').prependTo('#'+elwrapperid);

				// <span class="frmswtcheckboxoff"> </span>

			});
			
			$('.frmswtcheckbox input').change(function() {
				$(this).closest('.frmswtcheckbox').find('.frmswtcheckboxicon').toggleClass('frmswtcheckboxon');
			});

			$('.frmswtcheckbox').click(function () {
				var cbx = $(this).find('input[type=checkbox]');
				cbx.prop('checked', !cbx.prop('checked'));
				$(this).find('.frmswtcheckboxicon').toggleClass('frmswtcheckboxon');
			});

		}

		if (opt.styleselect) {
			$.fn.formsweet.buildselect(form);
//			buildselect(form);
		}
		if (opt.stylecheckbox) {
			$.fn.formsweet.buildcheckbox(form);
//			buildcheckbox(form);
		}

	}
})(jQuery);
