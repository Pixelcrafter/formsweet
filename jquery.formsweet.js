/***

	TODO:
	[ ] - multiple select
	[x] - optgroups

	[x] - checkboxes
	[ ] - radios

	[x] - Prevent double event binding on adding additional elements -> hack: unbind events if plugin is called multiple times
	[ ] - Optimizing event binding -> make it id based rather than element class based

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
		var cbxidcounter = 0; // checkbox id counter

		$.fn.formsweet.buildselect = function (obj) {
			/***
				- Attribute "size" will be ignored
				- Select elements with attribute "multiple" will not be styled
			***/

			var clickedselid;
			var oldselid;

			var createFrmswtSelectElement = function (o) {
				// check if it is not already a formsweet select element an not a multiple select
				// otherwise create it:
				if(!$(o).parent().hasClass('frmswtselect') && !$(o).attr('multiple')) {
					var el = $(o);
					selidcounter = selidcounter + 1;
					var elwrapperid = 'frmswtselect' + selidcounter;
					// wrap select element
					$(el).wrap('<div id="'+elwrapperid+'" class="frmswtselect"></div>');
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

			if ($(obj).is('select')) {
				createFrmswtSelectElement($(obj));
			} else {
				$(obj).find('select').each(function() {
					createFrmswtSelectElement($(this));
				});
			}


			// Reset previously bound frmswt events on selectelements
			$('.frmswtselect select').off('change');
			$('.frmswtselectedelement, .frmswtselectdropdown li').off('click');

			$('.frmswtselectedelement').on('click', function (event) {
				event.stopPropagation();
				clickedselid = getFrmswtSelectId(this);
				// At first close any previously opened frmswtselect element 
				if (oldselid && (clickedselid != oldselid)) {
					hideSelectDropDown($('#'+oldselid+' .frmswtselectdropdown'));
				}
				showSelectDropDown($('#'+clickedselid).find('.frmswtselectdropdown'));
				oldselid = clickedselid;
			});

			$('.frmswtselectdropdown li').not('.frmswtoptgroup').on('click', function() {
				// var eid = $(this).closest('.frmswtselect').attr('id');
				var elid = getFrmswtSelectId(this);
				// set selected value of original select element
				$('#'+elid+' select').val($(this).attr('data-value')).change();
				// set select info on new formsweet select element
				var dispval = $(this).attr('label') ? $(this).attr('label') : $(this).text();
				$('#'+elid+' span.frmswtselectedelementvalue').html(dispval);
				// remove old selected marker
				$('#'+elid+' li.selected').removeClass('selected');
				// ... and set new selected marker
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
			var label = $(el).attr('label') ? ' label="'+$(el).attr('label')+'"' : '';
			return '<li class="frmswtoption' + optgroupcl + ' ' + opt.selectelementclass + '" data-value="'+ $(el).val() +'"' + ttc + label + '>' + $(el).text() + '</li>';
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



		$.fn.formsweet.buildcheckbox = function (obj) {

			var createFrmswtCheckboxElement = function (o) {
				if(!$(o).closest('div').hasClass('frmswtcheckbox')) {

					cbxidcounter = cbxidcounter + 1;
					var el = $(o);
					var cbxid = el.attr('id');
					var cbxstateclass = '';
					var elwrapperid = 'frmswtcheckbox' + cbxidcounter;
					// try to find label with the coresponding 'for' attribute
					// start searching from two levels up
					var label = $(o).parent().parent().find('label[for='+el.attr('id')+']');
					// init var for 'alternative' label if required
					var altlabel;
					// if there is no 'for'-label
					if (label.length == 0) {
						// get 'next' label
						altlabel = el.next('label');
						if (altlabel.length == 0) {
							// if there is no 'next' label try 'prev' label
							altlabel = el.prev('label');
							if (altlabel.length == 0) {
								altlabel = $(o).closest('label');
							}
						}
						// if alternative label has a 'for'-attribute we assume it is for a different checkbox and ignore them
						if (!($(altlabel).attr('for'))) {
							label = altlabel;
						}
					}
					if($('#'+cbxid).prop('checked')) {
						cbxstateclass = ' frmswtcheckboxon';
					}
					$(label).wrap('<div id="'+elwrapperid+'" class="frmswtcheckbox"></div>');
					$(el).prependTo('#'+elwrapperid+' label');
					$('<span class="frmswtcheckboxicon'+cbxstateclass+'">&nbsp;</span>').prependTo('#'+elwrapperid);

				}
			}

			if ($(obj).is('input[type=checkbox]')) {
				createFrmswtCheckboxElement($(obj));
			} else {
				$(obj).find('input[type=checkbox]').each(function() {
					createFrmswtCheckboxElement($(this));
				});
			}

			// Reset previously bound frmswt events on checkboxes to avoid multiple binding
			$('.frmswtcheckbox input').off('change');
			$('.frmswtcheckbox').off('click');

			$('.frmswtcheckbox input').change(function() {
				setCheckboxIcon($(this));
			});

			$('.frmswtcheckbox').on('click','.frmswtcheckboxicon',function () {
				var cbx = $(this).parent().find('input[type=checkbox]');
				cbx.prop('checked', !cbx.prop('checked'));
				setCheckboxIcon(cbx);
			});

		}

		var setCheckboxIcon = function (el) {
			if ($(el).prop('checked')) {
				$(el).closest('.frmswtcheckbox').find('.frmswtcheckboxicon').addClass('frmswtcheckboxon');
			} else {
				$(el).closest('.frmswtcheckbox').find('.frmswtcheckboxicon').removeClass('frmswtcheckboxon');
			}
		}

		if (opt.styleselect) {
			$.fn.formsweet.buildselect(form);
		}
		if (opt.stylecheckbox) {
			$.fn.formsweet.buildcheckbox(form);
		}

	}
})(jQuery);
